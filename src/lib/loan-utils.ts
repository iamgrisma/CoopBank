
import { addMonths, differenceInDays, isPast, isToday } from "date-fns";

export type RepaymentFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'One-Time';

export type AmortizationEntry = {
  month: number; // Represents the installment number, not calendar month
  paymentDate: Date;
  beginningBalance: number;
  emi: number; // This is now EPI
  principal: number;
  interest: number;
  endingBalance: number;
  // Dynamic fields
  status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PARTIALLY_PAID' | 'SKIPPED';
  paidAmount: number;
  paidDate: Date | null;
  daysOverdue: number;
  penalInterest: number;
  penalty: number; // This is the 'Fine'
  totalDue: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  penalInterestPaid: number; 
};

export type IdealScheduleEntry = {
  month: number;
  paymentDate: Date;
  emi: number; // This is EPI
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
    penal_interest_paid: number;
};

export const PENALTY_RATE_PA = 0.05; // 5% per annum on the overdue EMI amount for the FINE.

const getMonthsPerPeriod = (frequency: RepaymentFrequency): number => {
    switch (frequency) {
        case 'Quarterly': return 3;
        case 'Half-Yearly': return 6;
        case 'Yearly': return 12;
        case 'One-Time': return Infinity;
        case 'Monthly':
        default:
            return 1;
    }
}


export const calculateEPI = (
    principal: number, 
    annualRate: number, 
    termMonths: number,
    frequency: RepaymentFrequency
): number => {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) return 0;
  
  const monthsPerPeriod = getMonthsPerPeriod(frequency);
  const monthlyRate = annualRate / 12 / 100;
  const numberOfInstallments = Math.ceil(termMonths / monthsPerPeriod);

  if (frequency === 'One-Time') {
    return principal * Math.pow(1 + monthlyRate, termMonths);
  }
  
  if (monthlyRate === 0) {
      return principal / numberOfInstallments;
  }
  
  // Calculate the effective periodic rate from the monthly rate
  const periodicRate = Math.pow(1 + monthlyRate, monthsPerPeriod) - 1;
  
  if (periodicRate === 0) {
    return principal / numberOfInstallments;
  }

  const epi =
    (principal * periodicRate * Math.pow(1 + periodicRate, numberOfInstallments)) /
    (Math.pow(1 + periodicRate, numberOfInstallments) - 1);
    
  return epi;
};

export const generateIdealSchedule = (
    principal: number,
    annualRate: number,
    termMonths: number,
    disbursementDate: Date,
    frequency: RepaymentFrequency,
    gracePeriodMonths: number = 0
): IdealScheduleEntry[] => {
    if (principal <= 0 || annualRate < 0 || termMonths <= 0) return [];

    const monthlyRate = annualRate / 12 / 100;
    const monthsPerPeriod = getMonthsPerPeriod(frequency);
    
    // 1. Calculate principal after grace period interest capitalization
    const principalAfterGrace = principal * Math.pow(1 + monthlyRate, gracePeriodMonths);
    const firstPaymentDate = addMonths(disbursementDate, gracePeriodMonths + monthsPerPeriod);

    // 2. Calculate EPI based on the new principal and remaining term
    const remainingTerm = termMonths - gracePeriodMonths;
    const epi = calculateEPI(principalAfterGrace, annualRate, remainingTerm, frequency);
    
    if (epi === 0 && principalAfterGrace > 0) return [];

    const schedule: IdealScheduleEntry[] = [];
    let currentBalance = principalAfterGrace;
    const numberOfInstallments = Math.ceil(remainingTerm / monthsPerPeriod);
    const periodicRate = Math.pow(1 + monthlyRate, monthsPerPeriod) - 1;

    for (let i = 1; i <= numberOfInstallments; i++) {
        const interest = currentBalance * periodicRate;
        const principalComponent = epi - interest;
        const endingBalance = currentBalance - principalComponent;

        schedule.push({
            month: i,
            paymentDate: addMonths(firstPaymentDate, (i - 1) * monthsPerPeriod),
            emi: epi,
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
  repayments: Repayment[],
  frequency: RepaymentFrequency,
  gracePeriodMonths: number
): AmortizationEntry[] => {
  const idealSchedule = generateIdealSchedule(principal, annualRate, termMonths, disbursementDate, frequency, gracePeriodMonths);
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

  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  // Apply historical payments
  for(const repayment of sortedRepayments) {
    const paymentDate = new Date(repayment.payment_date);

    // Run the due calculation as it would have been on the day of the payment
    const scheduleOnPaymentDate = calculateCurrentDues(schedule, annualRate, paymentDate);
    
    const allocation = allocatePayment(
        repayment.amount_paid, 
        scheduleOnPaymentDate.filter(i => i.status === 'OVERDUE' || i.status === 'DUE' || i.status === 'PARTIALLY_PAID'), 
        repayment.penalty_paid === 0 && repayment.amount_paid > 0 // A simple heuristic for waiver
    );

    // Distribute this historical allocation back into the main schedule
    let { principal: pToPay, interest: iToPay, penalInterest: piToPay, fine: fToPay } = allocation;

    for (const inst of schedule.sort((a,b) => a.month - b.month)) {
      if (pToPay <= 0 && iToPay <= 0 && piToPay <= 0 && fToPay <= 0) break;

      const fineDue = inst.penalty - inst.penaltyPaid;
      if (fToPay > 0 && fineDue > 0) {
          const paid = Math.min(fToPay, fineDue);
          inst.penaltyPaid += paid;
          fToPay -= paid;
      }
      
      const penalInterestDue = inst.penalInterest - inst.penalInterestPaid;
      if (piToPay > 0 && penalInterestDue > 0) {
          const paid = Math.min(piToPay, penalInterestDue);
          inst.penalInterestPaid += paid;
          piToPay -= paid;
      }

      const interestDue = inst.interest - inst.interestPaid;
      if (iToPay > 0 && interestDue > 0) {
          const paid = Math.min(iToPay, interestDue);
          inst.interestPaid += paid;
          iToPay -= paid;
      }

      const principalDue = inst.principal - inst.principalPaid;
      if (pToPay > 0 && principalDue > 0) {
          const paid = Math.min(pToPay, principalDue);
          inst.principalPaid += paid;
          pToPay -= paid;
      }
    }
  }


  // 3. Finally, update the current status, penalties, and totalDue for each installment based on today's date.
  const finalSchedule = calculateCurrentDues(schedule, annualRate, new Date());


  return finalSchedule;
};

// Helper function to calculate dues, penalties, and status for a given date.
const calculateCurrentDues = (schedule: AmortizationEntry[], annualRate: number, asOfDate: Date): AmortizationEntry[] => {
    const today = asOfDate;
    today.setHours(0, 0, 0, 0);

    schedule.forEach(entry => {
        const dueDate = new Date(entry.paymentDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Skip calculations for installments that are fully paid
        if ((entry.principal - entry.principalPaid) < 0.01 && (entry.interest - entry.interestPaid) < 0.01) {
            entry.status = 'PAID';
            entry.totalDue = 0;
            return;
        }

        const outstandingPrincipal = Math.max(0, entry.principal - entry.principalPaid);
        const outstandingInterest = Math.max(0, entry.interest - entry.interestPaid);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        
        // This is the remaining part of the original scheduled payment
        const outstandingEPI = outstandingPrincipal + outstandingInterest;
        
        // Calculate Penalties and Fines only if it's overdue and there's a balance on the original EPI
        entry.daysOverdue = 0;
        entry.penalInterest = 0;
        entry.penalty = 0;

        if (isOverdue && outstandingEPI > 0) {
            entry.daysOverdue = differenceInDays(today, dueDate);
            if (entry.daysOverdue > 0) {
                // Penal interest is on the outstanding EPI amount at the main loan interest rate
                const dailyMainRate = annualRate / 365 / 100;
                entry.penalInterest = outstandingEPI * dailyMainRate * entry.daysOverdue;
                
                // Fine is also on the outstanding EPI amount at a separate penalty rate
                const dailyPenaltyRate = PENALTY_RATE_PA / 365;
                entry.penalty = outstandingEPI * dailyPenaltyRate * entry.daysOverdue;
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
): { principal: number; interest: number; penalInterest: number; fine: number; savings: number; } => {
    let remainingAmount = paymentAmount;
    const allocation = {
        principal: 0,
        interest: 0, 
        penalInterest: 0,
        fine: 0,
        savings: 0,
    };

    const sortedDues = [...dueInstallments].sort((a,b) => a.month - b.month);

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        // 1. Pay Fine (if not waived)
        if (!waiveFine) {
            const fineDue = installment.penalty - installment.penaltyPaid;
            if (fineDue > 0) {
                const amountToPay = Math.min(remainingAmount, fineDue);
                allocation.fine += amountToPay;
                remainingAmount -= amountToPay;
                if (remainingAmount <= 0) continue;
            }
        }
        
        // 2. Pay Penal Interest
        const penalInterestDue = installment.penalInterest - installment.penalInterestPaid;
        if (penalInterestDue > 0) {
            const amountToPay = Math.min(remainingAmount, penalInterestDue);
            allocation.penalInterest += amountToPay;
            remainingAmount -= amountToPay;
            if (remainingAmount <= 0) continue;
        }

        // 3. Pay Regular Interest
        const interestDue = installment.interest - installment.interestPaid;
        if (interestDue > 0) {
            const amountToPay = Math.min(remainingAmount, interestDue);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
            if (remainingAmount <= 0) continue;
        }

        // 4. Pay Principal
        const principalDue = installment.principal - installment.principalPaid;
        if (principalDue > 0) {
            const amountToPay = Math.min(remainingAmount, principalDue);
            allocation.principal += amountToPay;
            remainingAmount -= amountToPay;
        }
    }

    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
