

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
      const paymentDate = new Date(repayment.payment_date);
      
      let amountToAllocate = repayment.amount_paid;

      const dueInstallments = schedule
        .filter(entry => entry.paymentDate <= paymentDate && entry.status !== 'PAID')
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());

      for (const installment of dueInstallments) {
        if(amountToAllocate <= 0) break;

        // Note: For historical payments from DB, penal interest and penalty are already calculated and stored.
        // We just need to track what was paid.
        const principalToPay = Math.min(amountToAllocate, repayment.principal_paid);
        installment.principalPaid += principalToPay;
        amountToAllocate -= principalToPay;

        const interestToPay = Math.min(amountToAllocate, repayment.interest_paid);
        installment.interestPaid += interestToPay;
        amountToAllocate -= interestToPay;

        const penalInterestToPay = Math.min(amountToAllocate, repayment.penal_interest_paid);
        installment.penalInterestPaid += penalInterestToPay;
        amountToAllocate -= penalInterestToPay;
        
        const penaltyToPay = Math.min(amountToAllocate, repayment.penalty_paid);
        installment.penaltyPaid += penaltyToPay;
        amountToAllocate -= penaltyToPay;
      }
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

    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        // 1. Pay Fine (if not waived)
        if (!waiveFine) {
            const outstandingFine = installment.penalty - installment.penaltyPaid;
            if (outstandingFine > 0) {
                const amountToPay = Math.min(remainingAmount, outstandingFine);
                allocation.fine += amountToPay;
                remainingAmount -= amountToPay;
                if (remainingAmount <= 0) break;
            }
        }
        
        // 2. Pay Penal Interest
        const outstandingPenalInterest = installment.penalInterest - installment.penalInterestPaid;
        if (outstandingPenalInterest > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPenalInterest);
            allocation.penalInterest += amountToPay;
            remainingAmount -= amountToPay;
            if (remainingAmount <= 0) break;
        }
        
        // 3. Pay Regular Interest
        const outstandingInterest = installment.interest - installment.interestPaid;
        if (outstandingInterest > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingInterest);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
            if (remainingAmount <= 0) break;
        }

        // 4. Pay Principal
        const outstandingPrincipal = installment.principal - installment.principalPaid;
        if (outstandingPrincipal > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPrincipal);
            allocation.principal += amountToPay;
            remainingAmount -= amountToPay;
            if (remainingAmount <= 0) break;
        }
    }

    // Any leftover amount goes to savings
    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
