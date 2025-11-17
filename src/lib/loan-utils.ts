

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
  penalty: number; // This is the 'Fine'
  totalDue: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  penalInterestPaid: number; // New field to track this separately
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
    penal_interest_paid: number; // Add to type
};

export const PENALTY_RATE_PA = 0.05; // 5% per annum on the overdue EMI amount for the FINE.

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
  
  const idealSchedule = generateIdealSchedule(principal, annualRate, termMonths, disbursementDate);
  if (idealSchedule.length === 0) return [];

  const schedule: AmortizationEntry[] = idealSchedule.map(idealEntry => ({
      ...idealEntry,
      status: 'UPCOMING',
      paidAmount: 0,
      paidDate: null,
      daysOverdue: 0,
      penalInterest: 0,
      penalty: 0,
      totalDue: idealEntry.emi,
      principalPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
      penalInterestPaid: 0,
  }));
  
  // Apply historical payments chronologically
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  sortedRepayments.forEach(repayment => {
      // This logic is simplified as we trust the DB values for historical payments.
      // We just need to sum them up for the correct installments.
      // A more complex logic would re-run allocation for each past payment.
      const installment = schedule.find(inst => {
          const instDate = new Date(inst.paymentDate);
          instDate.setHours(0,0,0,0);
          const payDate = new Date(repayment.payment_date);
          payDate.setHours(0,0,0,0);
          return instDate >= payDate;
      }) || schedule[schedule.length - 1]; // fallback to last installment

      // Approximate allocation for past payments for display
      installment.principalPaid += repayment.principal_paid;
      installment.interestPaid += repayment.interest_paid;
      installment.penalInterestPaid += repayment.penal_interest_paid;
      installment.penaltyPaid += repayment.penalty_paid;
  });


  // Finally, update the current status and totalDue for each installment based on today's date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  schedule.forEach(entry => {
    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Reset calculations for this run
    entry.daysOverdue = 0;
    entry.penalInterest = 0;
    entry.penalty = 0;

    const outstandingPrincipal = Math.max(0, entry.principal - entry.principalPaid);
    const outstandingInterest = Math.max(0, entry.interest - entry.interestPaid);
    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const outstandingEMI = outstandingPrincipal + outstandingInterest;
    
    // Calculate Penalties and Fines only if it's overdue and there's a balance
    if (isOverdue && outstandingEMI > 0) {
        entry.daysOverdue = differenceInDays(today, dueDate);
        if (entry.daysOverdue > 0) {
            // Penal interest is on the outstanding EMI amount
            const dailyMainRate = annualRate / 365 / 100;
            entry.penalInterest = outstandingEMI * dailyMainRate * entry.daysOverdue;
            
            // Fine is also on the outstanding EMI amount
            const dailyPenaltyRate = PENALTY_RATE_PA / 365;
            entry.penalty = outstandingEMI * dailyPenaltyRate * entry.daysOverdue;
        }
    }
    
    const outstandingPenalInterest = Math.max(0, entry.penalInterest - entry.penalInterestPaid);
    const outstandingFine = Math.max(0, entry.penalty - entry.penaltyPaid);

    entry.totalDue = outstandingPrincipal + outstandingInterest + outstandingPenalInterest + outstandingFine;

    // Determine status
    if (entry.totalDue < 0.01) {
        entry.status = 'PAID';
        entry.totalDue = 0;
    } else {
        const isPartiallyPaid = entry.principalPaid > 0 || entry.interestPaid > 0 || entry.penaltyPaid > 0 || entry.penalInterestPaid > 0;
        if (isOverdue) {
            entry.status = isPartiallyPaid ? 'PARTIALLY_PAID' : 'OVERDUE';
        } else if (isToday(dueDate)) {
            entry.status = isPartiallyPaid ? 'PARTIALLY_PAID' : 'DUE';
        } else {
            entry.status = 'UPCOMING';
        }
        if (entry.status === 'UPCOMING') {
          entry.totalDue = 0; // Don't show a due amount for upcoming payments
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
    waiveFine: boolean
) => {
    let remainingAmount = paymentAmount;
    const allocation = {
        principal: 0,
        interest: 0, 
        penalInterest: 0,
        fine: 0,
        savings: 0,
    };

    // 1. Sort installments by date, oldest first, to ensure oldest dues are paid first.
    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    // Helper function to apply payment to a category and reduce remaining amount
    const pay = (amountToPay: number) => {
        const paid = Math.min(remainingAmount, amountToPay);
        remainingAmount -= paid;
        return paid;
    };

    // 2. Loop through each sorted installment and clear dues according to the hierarchy
    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        // A. Pay Fine (if not waived)
        if (!waiveFine) {
            const outstandingFine = Math.max(0, installment.penalty - installment.penaltyPaid);
            if (outstandingFine > 0) {
                allocation.fine += pay(outstandingFine);
            }
        }
        if (remainingAmount <= 0) break;
        
        // B. Pay Penal Interest
        const outstandingPenalInterest = Math.max(0, installment.penalInterest - installment.penalInterestPaid);
        if (outstandingPenalInterest > 0) {
            allocation.penalInterest += pay(outstandingPenalInterest);
        }
        if (remainingAmount <= 0) break;

        // C. Pay Regular Interest
        const outstandingInterest = Math.max(0, installment.interest - installment.interestPaid);
        if (outstandingInterest > 0) {
            allocation.interest += pay(outstandingInterest);
        }
        if (remainingAmount <= 0) break;

        // D. Pay Principal
        const outstandingPrincipal = Math.max(0, installment.principal - installment.principalPaid);
        if (outstandingPrincipal > 0) {
            allocation.principal += pay(outstandingPrincipal);
        }
    }

    // 3. Any leftover amount goes to savings
    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
