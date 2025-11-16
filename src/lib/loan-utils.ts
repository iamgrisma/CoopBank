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
  const emi = calculateEMI(principal, annualRate, termMonths);
  if (emi === 0) return [];

  // 1. Generate the static, ideal amortization schedule
  const schedule: AmortizationEntry[] = [];
  let currentBalance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let i = 1; i <= termMonths; i++) {
    const interest = currentBalance * monthlyRate;
    const principalComponent = emi - interest;
    currentBalance -= principalComponent;

    schedule.push({
      month: i,
      paymentDate: addMonths(disbursementDate, i),
      beginningBalance: currentBalance + principalComponent,
      emi: emi,
      principal: principalComponent,
      interest: interest,
      endingBalance: currentBalance,
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
    });
  }

  // Adjust last payment to close the loan exactly
  if (schedule.length > 0) {
    const lastEntry = schedule[schedule.length - 1];
    lastEntry.principal += lastEntry.endingBalance;
    lastEntry.emi += lastEntry.endingBalance;
    lastEntry.totalDue += lastEntry.endingBalance;
    lastEntry.endingBalance = 0;
  }

  // 2. Apply all historical repayments to the schedule
  repayments.forEach(repayment => {
    let remainingPayment = repayment.amount_paid;
    
    // Find all installments that are due before or on the payment date
    for (const entry of schedule) {
      const dueDate = new Date(entry.paymentDate);
      dueDate.setHours(0, 0, 0, 0);
      const paymentDate = new Date(repayment.payment_date);
      paymentDate.setHours(0,0,0,0);

      if (paymentDate <= dueDate && remainingPayment > 0) {
          // This is a complex part. For simplicity, we allocate payment to the *next* unpaid/partially paid installment
          // A more complex model would handle prepayments vs overdue payments differently.
          
          const duePenalty = (entry.penalty + entry.penalInterest) - entry.penaltyPaid;
          const dueInterest = entry.interest - entry.interestPaid;
          const duePrincipal = entry.principal - entry.principalPaid;
          
          // Allocate to penalty
          const penaltyToPay = Math.min(remainingPayment, duePenalty > 0 ? duePenalty : 0);
          entry.penaltyPaid += penaltyToPay;
          remainingPayment -= penaltyToPay;

          // Allocate to interest
          const interestToPay = Math.min(remainingPayment, dueInterest > 0 ? dueInterest : 0);
          entry.interestPaid += interestToPay;
          remainingPayment -= interestToPay;

          // Allocate to principal
          const principalToPay = Math.min(remainingPayment, duePrincipal > 0 ? duePrincipal : 0);
          entry.principalPaid += principalToPay;
          remainingPayment -= principalToPay;

          entry.paidAmount = entry.principalPaid + entry.interestPaid + entry.penaltyPaid;
          
          if (remainingPayment <= 0) break;
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

    // Calculate penalty if installment is overdue and not fully paid
    if ((isOverdue || isDueToday) && (entry.principalPaid < entry.principal || entry.interestPaid < entry.interest)) {
        const outstandingPrincipal = entry.principal - entry.principalPaid;
        const outstandingInterest = entry.interest - entry.interestPaid;
        const outstandingForInstallment = outstandingPrincipal + outstandingInterest;
        
        if (outstandingForInstallment > 0) {
            entry.daysOverdue = differenceInDays(today, dueDate);
            if (entry.daysOverdue > 0) {
                const dailyRate = annualRate / 365 / 100;
                const dailyPenaltyRate = PENALTY_RATE_PA / 365;

                // Penal interest on the entire outstanding EMI for the period
                entry.penalInterest = entry.emi * dailyRate * entry.daysOverdue;
                // Flat penalty on the outstanding EMI
                entry.penalty = entry.emi * dailyPenaltyRate * entry.daysOverdue;
            }
        }
    }
    
    const totalInstallmentCost = entry.emi + entry.penalInterest + entry.penalty;
    const totalPaidForInstallment = entry.principalPaid + entry.interestPaid + entry.penaltyPaid;
    
    if (totalPaidForInstallment >= totalInstallmentCost) {
        entry.status = 'PAID';
        entry.totalDue = 0;
    } else {
        if (isOverdue) {
            entry.status = 'OVERDUE';
        } else if (isDueToday) {
            entry.status = 'DUE';
        } else {
            entry.status = 'UPCOMING';
        }
        entry.totalDue = totalInstallmentCost - totalPaidForInstallment;
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

    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
