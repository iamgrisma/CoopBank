
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
  status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PARTIALLY_PAID';
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

export type IdealScheduleEntry = {
  month: number;
  paymentDate: Date;
  emi: number;
  principal: number;
  interest: number;
  endingBalance: number;
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

export const PENALTY_RATE_PA = 0.05; // 5% per annum on the overdue EMI amount.

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

export const generateIdealSchedule = (
    principal: number,
    annualRate: number,
    termMonths: number,
    disbursementDate: Date
): IdealScheduleEntry[] => {
    if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
        return [];
    }

    const emi = calculateEMI(principal, annualRate, termMonths);
    if (emi === 0 && principal > 0) return [];

    const schedule: IdealScheduleEntry[] = [];
    let currentBalance = principal;
    const monthlyRate = annualRate / 12 / 100;

    for (let i = 1; i <= termMonths; i++) {
        const interest = currentBalance * monthlyRate;
        const principalComponent = emi - interest;
        const endingBalance = currentBalance - principalComponent;

        schedule.push({
            month: i,
            paymentDate: addMonths(disbursementDate, i),
            emi: emi,
            principal: principalComponent,
            interest: interest,
            endingBalance: endingBalance,
        });

        currentBalance = endingBalance;
    }
    
    // Adjust last payment to close the loan exactly
    if (schedule.length > 0) {
        const lastEntry = schedule[schedule.length - 1];
        const balanceRemnant = lastEntry.endingBalance;
        if (Math.abs(balanceRemnant) > 0.01) { // Use a threshold for floating point inaccuracies
            lastEntry.principal += balanceRemnant;
            lastEntry.emi += balanceRemnant;
            lastEntry.endingBalance = 0;
        } else {
            lastEntry.endingBalance = 0;
        }
    }

    return schedule;
}


export const generateDynamicAmortizationSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number,
  disbursementDate: Date,
  repayments: Repayment[]
): AmortizationEntry[] => {
  
  // 1. Generate the ideal schedule as a base.
  const idealSchedule = generateIdealSchedule(principal, annualRate, termMonths, disbursementDate);
  if (idealSchedule.length === 0) return [];

  // 2. Enhance it into the full dynamic schedule structure.
  const schedule: AmortizationEntry[] = idealSchedule.map(idealEntry => ({
      ...idealEntry,
      status: 'UPCOMING',
      paidAmount: 0,
      paidDate: null,
      daysOverdue: 0,
      penalInterest: 0,
      penalty: 0,
      totalDue: idealEntry.emi, // Initially, total due is the EMI
      principalPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
  }));
  
  // 3. Apply all historical repayments chronologically.
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  for (const repayment of sortedRepayments) {
      let remainingPayment = repayment.amount_paid;
      const paymentDate = new Date(repayment.payment_date);
      paymentDate.setHours(0,0,0,0);
      
      // A payment can only apply to installments due on or before the payment date.
      for (const entry of schedule) {
          if (remainingPayment <= 0) break;

          const dueDate = new Date(entry.paymentDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate <= paymentDate) {
              // Calculate theoretical penalties for this entry based on the payment date
              let currentPenalInterest = 0;
              let currentPenalty = 0;
              const daysOverdueAtPaymentTime = differenceInDays(paymentDate, dueDate);

              if (daysOverdueAtPaymentTime > 0) {
                  const dailyRate = annualRate / 365 / 100;
                  // Penal interest on the entire original EMI
                  currentPenalInterest = entry.emi * dailyRate * daysOverdueAtPaymentTime;
                  
                  const dailyPenaltyRate = PENALTY_RATE_PA / 365;
                  // Fine on the entire original EMI
                  currentPenalty = entry.emi * dailyPenaltyRate * daysOverdueAtPaymentTime;
              }

              // Now, calculate what is *still outstanding* for this entry before applying the current payment.
              const outstandingPenalty = (currentPenalInterest + currentPenalty) - entry.penaltyPaid;
              const outstandingInterest = entry.interest - entry.interestPaid;
              const outstandingPrincipal = entry.principal - entry.principalPaid;

              // Apply payment in order: Penalty -> Interest -> Principal
              if (outstandingPenalty > 0) {
                  const amountToApply = Math.min(remainingPayment, outstandingPenalty);
                  entry.penaltyPaid += amountToApply;
                  remainingPayment -= amountToApply;
              }
              if (remainingPayment <= 0) continue;
              
              if (outstandingInterest > 0) {
                  const amountToApply = Math.min(remainingPayment, outstandingInterest);
                  entry.interestPaid += amountToApply;
                  remainingPayment -= amountToApply;
              }
              if (remainingPayment <= 0) continue;

              if (outstandingPrincipal > 0) {
                  const amountToApply = Math.min(remainingPayment, outstandingPrincipal);
                  entry.principalPaid += amountToApply;
                  remainingPayment -= amountToApply;
              }
          }
      }
  }

  // 4. Finally, update the current status and totalDue for each installment based on today's date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  schedule.forEach(entry => {
    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Recalculate penalties based on TODAY.
    entry.daysOverdue = 0;
    entry.penalInterest = 0;
    entry.penalty = 0;
    const isOverdue = isPast(dueDate) && !isToday(dueDate);

    if (isOverdue) {
        entry.daysOverdue = differenceInDays(today, dueDate);
        if (entry.daysOverdue > 0) {
            const dailyRate = annualRate / 365 / 100;
            entry.penalInterest = entry.emi * dailyRate * entry.daysOverdue;
            const dailyPenaltyRate = PENALTY_RATE_PA / 365;
            entry.penalty = entry.emi * dailyPenaltyRate * entry.daysOverdue;
        }
    }
    
    // Calculate what's currently outstanding.
    const outstandingPenalty = (entry.penalty + entry.penalInterest) - entry.penaltyPaid;
    const outstandingInterest = entry.interest - entry.interestPaid;
    const outstandingPrincipal = entry.principal - entry.principalPaid;

    const totalOutstanding = (outstandingPenalty > 0 ? outstandingPenalty : 0) +
                             (outstandingInterest > 0 ? outstandingInterest : 0) +
                             (outstandingPrincipal > 0 ? outstandingPrincipal : 0);
    
    entry.totalDue = totalOutstanding;

    // Set status based on the final state.
    const isFullyPaid = entry.totalDue < 0.01;
    const isPartiallyPaid = entry.principalPaid > 0 || entry.interestPaid > 0 || entry.penaltyPaid > 0;

    if (isFullyPaid) {
        entry.status = 'PAID';
        entry.totalDue = 0;
    } else {
        if (isOverdue) {
            entry.status = isPartiallyPaid ? 'PARTIALLY_PAID' : 'OVERDUE';
        } else if (isToday(dueDate)) {
            entry.status = isPartiallyPaid ? 'PARTIALLY_PAID' : 'DUE';
        } else {
            entry.status = 'UPCOMING';
        }
        // For upcoming, don't show any "due" amount yet.
        if (entry.status === 'UPCOMING') {
          entry.totalDue = 0;
        }
    }
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


    