

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
  
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  // Apply historical payments
  schedule.forEach(entry => {
      const entryRepayments = sortedRepayments.filter(r => {
        const paymentDate = new Date(r.payment_date);
        paymentDate.setHours(0,0,0,0);
        const dueDate = new Date(entry.paymentDate);
        dueDate.setHours(0,0,0,0);
        // This is simplified. A real system would need to track which payment was for which installment.
        // For now, we assume payments are applied chronologically to installments.
        return paymentDate >= dueDate;
      });

      entry.principalPaid = entryRepayments.reduce((sum, r) => sum + (r.principal_paid || 0), 0);
      entry.interestPaid = entryRepayments.reduce((sum, r) => sum + (r.interest_paid || 0), 0);
      entry.penalInterestPaid = entryRepayments.reduce((sum, r) => sum + (r.penal_interest_paid || 0), 0);
      entry.penaltyPaid = entryRepayments.reduce((sum, r) => sum + (r.penalty_paid || 0), 0);
  });
  
  for (const repayment of sortedRepayments) {
      const allocation = allocatePayment(
          repayment.amount_paid,
          schedule.filter(e => new Date(e.paymentDate) <= new Date(repayment.payment_date)),
          false // Don't assume waiver for historical payments
      );
      // This is a simplified model. We are directly using the stored paid amounts.
  }


  // Finally, update the current status and totalDue for each installment based on today's date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  schedule.forEach(entry => {
    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    
    entry.daysOverdue = 0;
    entry.penalInterest = 0;
    entry.penalty = 0;
    const isOverdue = isPast(dueDate) && !isToday(dueDate);

    const outstandingPrincipalForEMI = Math.max(0, entry.principal - entry.principalPaid);
    const outstandingInterestForEMI = Math.max(0, entry.interest - entry.interestPaid);
    const outstandingEMI = outstandingPrincipalForEMI + outstandingInterestForEMI;


    if (isOverdue && outstandingEMI > 0) {
        entry.daysOverdue = differenceInDays(today, dueDate);
        if (entry.daysOverdue > 0) {
            const dailyMainRate = annualRate / 365 / 100;
            entry.penalInterest = outstandingEMI * dailyMainRate * entry.daysOverdue;
            
            const dailyPenaltyRate = PENALTY_RATE_PA / 365;
            entry.penalty = outstandingEMI * dailyPenaltyRate * entry.daysOverdue;
        }
    }
    
    const outstandingFine = Math.max(0, entry.penalty - entry.penaltyPaid);
    const outstandingPenalInterest = Math.max(0, entry.penalInterest - entry.penalInterestPaid);

    const totalOutstanding = outstandingFine + outstandingPenalInterest + outstandingInterestForEMI + outstandingPrincipalForEMI;
    
    entry.totalDue = totalOutstanding;

    const isFullyPaid = entry.totalDue < 0.01 && outstandingEMI < 0.01;

    if (isFullyPaid) {
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
    waiveFine: boolean
) => {
    let remainingAmount = paymentAmount;
    
    const allocation = {
        principal: 0,
        interest: 0, 
        penalInterest: 0,
        fine: 0, // renamed from penalty
        savings: 0,
    };

    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        const outstandingFine = Math.max(0, installment.penalty - installment.penaltyPaid);
        const outstandingPenalInterest = Math.max(0, installment.penalInterest - installment.penalInterestPaid);
        const outstandingInterest = Math.max(0, installment.interest - installment.interestPaid);
        const outstandingPrincipal = Math.max(0, installment.principal - installment.principalPaid);

        // 1. Pay Fine (if not waived)
        if (!waiveFine && outstandingFine > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingFine);
            allocation.fine += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;
        
        // 2. Pay Penal Interest
        if (outstandingPenalInterest > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPenalInterest);
            allocation.penalInterest += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;
        
        // 3. Pay Regular Interest
        if (outstandingInterest > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingInterest);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;

        // 4. Pay Principal
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
