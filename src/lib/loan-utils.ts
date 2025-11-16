import { addMonths, differenceInDays, isPast, isToday } from "date-fns";

export type AmortizationEntry = {
  month: number;
  paymentDate: Date;
  beginningBalance: number;
  emi: number;
  principal: number;
  interest: number;
  endingBalance: number;
  // Dynamic fields
  status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE';
  paidAmount: number;
  paidDate: Date | null;
  daysOverdue: number;
  penalInterest: number;
  penalty: number;
  totalDue: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
};

export type Repayment = {
    id: string;
    loan_id: string;
    payment_date: string;
    amount_paid: number;
    notes: string | null;
    principal_paid: number;
    interest_paid: number;
    penalty_paid: number;
};

export const PENALTY_RATE_PA = 0.05; // 5% per annum

export const calculateEMI = (principal: number, annualRate: number, termMonths: number): number => {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) return 0;
  
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
      return principal / termMonths;
  }
  
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return emi;
};


export const generateDynamicAmortizationSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number,
  disbursementDate: Date,
  repayments: Repayment[]
): AmortizationEntry[] => {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    return [];
  }
  
  const emi = calculateEMI(principal, annualRate, termMonths);
  if (emi === 0 && principal > 0) return []; // Should not happen if inputs are valid

  // 1. Generate the static, ideal amortization schedule
  const schedule: AmortizationEntry[] = [];
  let currentBalance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let i = 1; i <= termMonths; i++) {
    const interest = currentBalance * monthlyRate;
    const principalComponent = emi - interest;
    
    const entry: AmortizationEntry = {
      month: i,
      paymentDate: addMonths(disbursementDate, i),
      beginningBalance: currentBalance,
      emi: emi,
      principal: principalComponent,
      interest: interest,
      endingBalance: currentBalance - principalComponent,
      // Dynamic fields reset
      status: 'UPCOMING',
      paidAmount: 0,
      paidDate: null,
      daysOverdue: 0,
      penalInterest: 0,
      penalty: 0,
      totalDue: emi,
      principalPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
    };
    currentBalance = entry.endingBalance;
    schedule.push(entry);
  }

  // Adjust last payment to close the loan exactly, preventing floating point remnants
  if (schedule.length > 0) {
    const lastEntry = schedule[schedule.length - 1];
    if (lastEntry.endingBalance !== 0) {
        lastEntry.principal += lastEntry.endingBalance;
        lastEntry.emi += lastEntry.endingBalance;
        lastEntry.endingBalance = 0;
    }
  }
  
  // 2. Apply all historical repayments to the schedule
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

  sortedRepayments.forEach(repayment => {
      let remainingPayment = repayment.amount_paid;
      
      // A payment can apply to multiple installments if it's large enough
      for (const entry of schedule) {
          if (remainingPayment <= 0) break;
          
          const isDue = new Date(repayment.payment_date) >= entry.paymentDate;
          if (isDue) {
              const outstandingPrincipal = entry.principal - entry.principalPaid;
              const outstandingInterest = entry.interest - entry.interestPaid;
              
              if (outstandingPrincipal > 0 || outstandingInterest > 0) {
                  // For simplicity in this model, we're not calculating penalties at the time of historical payment.
                  // We're just distributing the paid amount. Penalties are calculated live.

                  const interestToPay = Math.min(remainingPayment, outstandingInterest);
                  entry.interestPaid += interestToPay;
                  remainingPayment -= interestToPay;

                  const principalToPay = Math.min(remainingPayment, outstandingPrincipal);
                  entry.principalPaid += principalToPay;
                  remainingPayment -= principalToPay;
                  
                  entry.paidAmount += (interestToPay + principalToPay);
              }
          }
      }
  });


  // 3. Calculate current status, penalties, and total due for each installment
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  schedule.forEach(entry => {
    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);

    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const isDueToday = isToday(dueDate);

    // Reset dynamic calculations for this run
    entry.penalInterest = 0;
    entry.penalty = 0;
    entry.daysOverdue = 0;

    const principalFullyPaid = entry.principalPaid >= entry.principal;
    const interestFullyPaid = entry.interestPaid >= entry.interest;

    if (principalFullyPaid && interestFullyPaid) {
        entry.status = 'PAID';
        entry.totalDue = 0;
        return; // Move to next entry
    }

    // It's not fully paid, so let's see if it's due or upcoming
    if (!isOverdue && !isDueToday) {
        entry.status = 'UPCOMING';
        entry.totalDue = (entry.principal - entry.principalPaid) + (entry.interest - entry.interestPaid);
        return; // Move to next entry
    }

    // It's either DUE or OVERDUE
    const outstandingInstallmentAmount = (entry.principal - entry.principalPaid) + (entry.interest - entry.interestPaid);

    if (outstandingInstallmentAmount > 0) {
        if(isOverdue) {
            entry.status = 'OVERDUE';
            entry.daysOverdue = differenceInDays(today, dueDate);
            if (entry.daysOverdue > 0) {
                // Penal interest on the original EMI for the overdue period
                const dailyRate = annualRate / 365 / 100;
                entry.penalInterest = entry.emi * dailyRate * entry.daysOverdue;

                // Additional flat penalty fine
                const dailyPenaltyRate = PENALTY_RATE_PA / 365;
                entry.penalty = entry.emi * dailyPenaltyRate * entry.daysOverdue;
            }
        } else { // isDueToday
            entry.status = 'DUE';
        }
    }
    
    // Total due for this installment is what's left of principal, interest, plus any new penalties
    const outstandingPenalty = entry.penalty + entry.penalInterest - entry.penaltyPaid;
    entry.totalDue = outstandingInstallmentAmount + (outstandingPenalty > 0 ? outstandingPenalty : 0);
  });

  return schedule;
};


export const formatCurrency = (amount: number) => {
    if (isNaN(amount)) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 2,
      }).format(0).replace('NPR', 'रु');
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'रु');
}


export const calculateTotalRepaid = (repayments: Repayment[]): number => {
    return repayments.reduce((acc, repayment) => acc + repayment.amount_paid, 0);
};


export const allocatePayment = (
    paymentAmount: number, 
    dueInstallments: AmortizationEntry[],
    waivePenalty: boolean
) => {
    let remainingAmount = paymentAmount;
    
    const allocation = {
        principal: 0,
        interest: 0, 
        penalty: 0,
        savings: 0,
    };

    // IMPORTANT: Sort by due date to ensure oldest dues are paid first
    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        // Calculate what's currently outstanding for this specific installment
        const outstandingPenalty = (installment.penalty + installment.penalInterest) - installment.penaltyPaid;
        const outstandingInterest = installment.interest - installment.interestPaid;
        const outstandingPrincipal = installment.principal - installment.principalPaid;

        // 1. Pay Penalty (if not waived)
        if (!waivePenalty && outstandingPenalty > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPenalty);
            allocation.penalty += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;
        
        // 2. Pay Interest
        if (outstandingInterest > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingInterest);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;

        // 3. Pay Principal
        if (outstandingPrincipal > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPrincipal);
            allocation.principal += amountToPay;
            remainingAmount -= amountToPay;
        }
    }

    // Any amount left over after clearing all dues goes to savings
    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
