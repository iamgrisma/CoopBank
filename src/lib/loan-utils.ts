

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

  // 1. Initialize the live schedule from the ideal one
  const schedule: AmortizationEntry[] = idealSchedule.map(idealEntry => ({
    ...idealEntry,
    status: 'UPCOMING',
    paidAmount: 0,
    paidDate: null,
    daysOverdue: 0,
    penalInterest: 0,
    penalty: 0,
    totalDue: 0, // Will be calculated later
    principalPaid: 0,
    interestPaid: 0,
    penaltyPaid: 0,
    penalInterestPaid: 0,
  }));

  // 2. Apply all historical payments to the schedule
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

  // This is a temporary copy of the schedule to allocate payments against.
  const tempScheduleForAllocation = JSON.parse(JSON.stringify(schedule));

  for (const repayment of sortedRepayments) {
    const dueInstallments = tempScheduleForAllocation.filter((inst: AmortizationEntry) => 
        new Date(inst.paymentDate) < new Date(repayment.payment_date) && (inst.principal > inst.principalPaid || inst.interest > inst.interestPaid)
    ).sort((a:AmortizationEntry, b:AmortizationEntry) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    let remainingRepayment = repayment.amount_paid;

    for (const inst of dueInstallments) {
        if (remainingRepayment <= 0) break;
        // In this loop, we are just applying the already broken-down payment amounts from the DB
        // to the correct installments in our live schedule.
        const originalInstallment = schedule.find(s => s.month === inst.month)!;
        
        // This is a simplified distribution for reflecting history.
        // The real-time allocation happens in `allocatePayment`.
        // Here, we just need to ensure paid amounts from the DB reduce the balances in the schedule.
        
        let principalToDistribute = repayment.principal_paid;
        let interestToDistribute = repayment.interest_paid;
        let penalToDistribute = repayment.penal_interest_paid;
        let penaltyToDistribute = repayment.penalty_paid;

         // This logic needs to be smarter. Let's rebuild how historical payments are applied.
    }
  }
  
  // A better way to apply historical payments:
  // Reset all paid amounts first.
  for(const entry of schedule) {
    entry.principalPaid = 0;
    entry.interestPaid = 0;
    entry.penalInterestPaid = 0;
    entry.penaltyPaid = 0;
  }

  for (const repayment of sortedRepayments) {
    // For each payment, run the allocation logic against the state of the schedule *at that time*
    
    // First, calculate penalties on the schedule as it would have been on the payment day.
    const scheduleOnPaymentDate = calculateCurrentDues(schedule, new Date(repayment.payment_date));
    const dueInstallments = scheduleOnPaymentDate.filter(inst => inst.status === 'OVERDUE' || inst.status === 'DUE' || inst.status === 'PARTIALLY_PAID');
    
    // Allocate the payment based on the state of dues on that day.
    const allocation = allocatePayment(repayment.amount_paid, dueInstallments, false); // Assume fine was not waived for historical payments

    // Now distribute this allocation back into the main schedule
    let { principal, interest, penalInterest, fine } = allocation;

    for (const inst of schedule.sort((a,b) => a.month - b.month)) {
        if (principal <= 0 && interest <= 0 && penalInterest <= 0 && fine <= 0) break;
        
        const fineDue = inst.penalty - inst.penaltyPaid;
        if(fine > 0 && fineDue > 0) {
            const paid = Math.min(fine, fineDue);
            inst.penaltyPaid += paid;
            fine -= paid;
        }
        const penalDue = inst.penalInterest - inst.penalInterestPaid;
         if(penalInterest > 0 && penalDue > 0) {
            const paid = Math.min(penalInterest, penalDue);
            inst.penalInterestPaid += paid;
            penalInterest -= paid;
        }
        const interestDue = inst.interest - inst.interestPaid;
        if(interest > 0 && interestDue > 0) {
            const paid = Math.min(interest, interestDue);
            inst.interestPaid += paid;
            interest -= paid;
        }
        const principalDue = inst.principal - inst.principalPaid;
        if(principal > 0 && principalDue > 0) {
            const paid = Math.min(principal, principalDue);
            inst.principalPaid += paid;
            principal -= paid;
        }
    }
  }


  // 3. Finally, update the current status, penalties, and totalDue for each installment based on today's date.
  const finalSchedule = calculateCurrentDues(schedule, new Date());


  return finalSchedule;
};

// Helper function to calculate dues, penalties, and status for a given date.
const calculateCurrentDues = (schedule: AmortizationEntry[], asOfDate: Date): AmortizationEntry[] => {
    const today = asOfDate;
    today.setHours(0, 0, 0, 0);

    schedule.forEach(entry => {
        const dueDate = new Date(entry.paymentDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Reset dynamic calculations for this run
        entry.daysOverdue = 0;
        entry.penalInterest = 0;
        entry.penalty = 0;

        const outstandingPrincipal = Math.max(0, entry.principal - entry.principalPaid);
        const outstandingInterest = Math.max(0, entry.interest - entry.interestPaid);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        
        // This is the remaining part of the original scheduled payment
        const outstandingEMI = outstandingPrincipal + outstandingInterest;
        
        // Calculate Penalties and Fines only if it's overdue and there's a balance on the original EMI
        if (isOverdue && outstandingEMI > 0) {
            entry.daysOverdue = differenceInDays(today, dueDate);
            if (entry.daysOverdue > 0) {
                const annualRate = (entry.interest / entry.beginningBalance) * 12 * 100;
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
}


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

    const applyPayment = (amountToPay: number, due: number): [number, number] => {
        const paid = Math.min(amountToPay, due);
        return [paid, amountToPay - paid];
    };

    // 1. Sort installments by date, oldest first, to ensure oldest dues are paid first.
    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    // 2. Loop through each sorted installment and clear dues according to the hierarchy
    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        let paid;

        // A. Pay Fine (if not waived)
        const fineDue = installment.penalty - installment.penaltyPaid;
        if (!waiveFine && fineDue > 0) {
            [paid, remainingAmount] = applyPayment(remainingAmount, fineDue);
            allocation.fine += paid;
        }
        if (remainingAmount <= 0) continue;
        
        // B. Pay Penal Interest
        const penalInterestDue = installment.penalInterest - installment.penalInterestPaid;
        if (penalInterestDue > 0) {
            [paid, remainingAmount] = applyPayment(remainingAmount, penalInterestDue);
            allocation.penalInterest += paid;
        }
        if (remainingAmount <= 0) continue;

        // C. Pay Regular Interest
        const interestDue = installment.interest - installment.interestPaid;
        if (interestDue > 0) {
            [paid, remainingAmount] = applyPayment(remainingAmount, interestDue);
            allocation.interest += paid;
        }
        if (remainingAmount <= 0) continue;

        // D. Pay Principal
        const principalDue = installment.principal - installment.principalPaid;
        if (principalDue > 0) {
            [paid, remainingAmount] = applyPayment(remainingAmount, principalDue);
            allocation.principal += paid;
        }
    }

    // 3. Any leftover amount goes to savings
    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};

