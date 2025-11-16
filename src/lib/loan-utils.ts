import { addMonths, format, differenceInDays, isPast, isToday } from "date-fns";

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
  paymentId: string | null;
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

/**
 * Generates a dynamic amortization schedule that calculates dues, penalties, and payment status.
 */
export const generateDynamicAmortizationSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number,
  disbursementDate: Date,
  repayments: Repayment[]
): AmortizationEntry[] => {
  const emi = calculateEMI(principal, annualRate, termMonths);
  if (emi === 0 && principal > 0) { // Handle zero-interest loans
    const flatPrincipal = principal / termMonths;
    const schedule: AmortizationEntry[] = [];
    for (let i = 1; i <= termMonths; i++) {
        schedule.push({
            month: i,
            paymentDate: addMonths(disbursementDate, i),
            beginningBalance: principal - (flatPrincipal * (i - 1)),
            emi: flatPrincipal,
            principal: flatPrincipal,
            interest: 0,
            endingBalance: principal - (flatPrincipal * i),
            status: 'UPCOMING',
            paidAmount: 0,
            paidDate: null,
            daysOverdue: 0,
            penalInterest: 0,
            penalty: 0,
            totalDue: flatPrincipal,
            paymentId: null,
            principalPaid: 0,
            interestPaid: 0,
            penaltyPaid: 0,
        });
    }
    return schedule; // This is a simplified path for zero interest
  }
  if (emi === 0) return [];


  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principalComponent = emi - interest;
    
    schedule.push({
      month: i,
      paymentDate: addMonths(disbursementDate, i),
      beginningBalance: balance,
      emi: emi,
      principal: principalComponent > 0 ? principalComponent : 0,
      interest: interest > 0 ? interest : 0,
      endingBalance: balance - (principalComponent > 0 ? principalComponent : 0),
      status: 'UPCOMING',
      paidAmount: 0,
      paidDate: null,
      daysOverdue: 0,
      penalInterest: 0,
      penalty: 0,
      totalDue: emi,
      paymentId: null,
      principalPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
    });
    balance -= principalComponent;
  }
  
  // Make final month's balance zero to account for rounding errors
  if (schedule.length > 0) {
      const lastEntry = schedule[schedule.length - 1];
      lastEntry.principal += lastEntry.endingBalance;
      lastEntry.emi += lastEntry.endingBalance;
      lastEntry.totalDue += lastEntry.endingBalance;
      lastEntry.endingBalance = 0;
  }

  // --- Dynamic Calculation Section ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a mutable copy of repayments to track allocation
  const availableRepayments = [...repayments].sort((a,b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  let totalPrincipalPaidToDate = 0;

  schedule.forEach(entry => {
    
    // Calculate total principal paid up to the start of this installment
    const interestBearingPrincipal = principal - totalPrincipalPaidToDate;
    entry.interest = interestBearingPrincipal * monthlyRate;
    entry.principal = entry.emi - entry.interest;
    
    // Recalculate ending balance based on new interest/principal split
    entry.endingBalance = entry.beginningBalance - entry.principal;


    // Reset paid amounts for this loop
    entry.principalPaid = 0;
    entry.interestPaid = 0;
    entry.penaltyPaid = 0;

    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);

    // Apply payments to installments
    for (let i = availableRepayments.length - 1; i >= 0; i--) {
        const payment = availableRepayments[i];
        
        entry.principalPaid += payment.principal_paid;
        entry.interestPaid += payment.interest_paid;
        entry.penaltyPaid += payment.penalty_paid;

        // Simplified: assume one payment clears one installment for now.
        // A full system would need to allocate partial payments.
        availableRepayments.splice(i, 1);
    }
    
    const totalPaidForInstallment = entry.principalPaid + entry.interestPaid + entry.penaltyPaid;

    if (totalPaidForInstallment >= entry.emi) {
        entry.status = 'PAID';
        entry.paidAmount = totalPaidForInstallment;
        // In a real system, you'd find the actual payment date. This is an approximation.
        entry.paidDate = new Date(repayments.find(r => r.id)?.payment_date || entry.paymentDate);
        entry.totalDue = 0;
        entry.penalty = 0;
        entry.penalInterest = 0;
    } else {
         if (isToday(dueDate)) {
            entry.status = 'DUE';
        } else if (isPast(dueDate)) {
            entry.status = 'OVERDUE';
            entry.daysOverdue = differenceInDays(today, dueDate);
            
            const dailyRate = annualRate / 365 / 100;
            const dailyPenaltyRate = PENALTY_RATE_PA / 365;

            // Penal interest on the outstanding EMI amount
            const outstandingEmi = entry.emi - totalPaidForInstallment;
            entry.penalInterest = outstandingEmi * dailyRate * entry.daysOverdue;
            
            // Additional flat penalty
            entry.penalty = outstandingEmi * dailyPenaltyRate * entry.daysOverdue;
            
            entry.totalDue = outstandingEmi + entry.penalInterest + entry.penalty;

        } else {
            entry.status = 'UPCOMING';
            entry.totalDue = entry.emi - totalPaidForInstallment;
        }
    }
    totalPrincipalPaidToDate += entry.principalPaid;
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

/**
 * Allocates a payment into principal, interest, and penalty buckets.
 */
export const allocatePayment = (
    paymentAmount: number, 
    dueInstallments: AmortizationEntry[],
    waivePenalty: boolean
) => {
    let remainingAmount = paymentAmount;
    
    const allocation = {
        principal: 0,
        interest: 0, // This will include regular + penal
        penalty: 0,
        savings: 0,
    };

    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        const outstandingPenalty = installment.penalty - installment.penaltyPaid;
        const outstandingInterest = (installment.interest + installment.penalInterest) - installment.interestPaid;
        const outstandingPrincipal = installment.principal - installment.principalPaid;


        // 1. Pay Penalty (if not waived)
        if (!waivePenalty && outstandingPenalty > 0) {
            const amountToPay = Math.min(remainingAmount, outstandingPenalty);
            allocation.penalty += amountToPay;
            remainingAmount -= amountToPay;
        }

        if (remainingAmount <= 0) break;
        
        // 2. Pay Penal Interest + Regular Interest
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

    // If there's still money left after paying all dues, it goes to savings
    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
