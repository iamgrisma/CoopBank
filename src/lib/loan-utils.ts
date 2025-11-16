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
  if (emi === 0) return [];

  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;
  const dailyRate = annualRate / 365 / 100;

  const repaymentsCopy = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
  
  let principalRepaidSoFar = 0;

  for (let i = 1; i <= termMonths; i++) {
    const interest = (balance + principalRepaidSoFar) * monthlyRate;
    const principalComponent = emi - interest;

    const entry: AmortizationEntry = {
      month: i,
      paymentDate: addMonths(disbursementDate, i),
      beginningBalance: balance,
      emi: emi,
      principal: principalComponent,
      interest: interest,
      endingBalance: balance - principalComponent,
      status: 'UPCOMING',
      paidAmount: 0,
      paidDate: null,
      daysOverdue: 0,
      penalInterest: 0,
      penalty: 0,
      totalDue: emi,
      paymentId: null,
    };
    
    // Distribute payments to installments
    const correspondingPayment = repaymentsCopy.find(p => {
        // A simple heuristic: find the first unpaid installment for a payment.
        // A more robust system might link payments directly to installments.
        return new Date(p.payment_date) >= entry.paymentDate && !p.loan_id.includes('allocated')
    });
    
    // This is a simplified logic. A real system would need to handle complex payment allocations.
    // For now, let's just mark installments as paid based on repayment records.
    // We will assume one repayment pays one installment for simplicity.
    if(repayments.length >= i){
        const payment = repayments[repayments.length - i];
        entry.status = 'PAID';
        entry.paidAmount = payment.amount_paid;
        entry.paidDate = new Date(payment.payment_date);
        entry.paymentId = payment.id;
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (entry.status !== 'PAID') {
        const dueDate = new Date(entry.paymentDate);
        dueDate.setHours(0,0,0,0);

        if (isToday(dueDate)) {
            entry.status = 'DUE';
        } else if (isPast(dueDate)) {
            entry.status = 'OVERDUE';
            entry.daysOverdue = differenceInDays(today, dueDate);
            
            // Calculate penal interest on the EMI amount for the overdue period
            entry.penalInterest = entry.emi * dailyRate * entry.daysOverdue;

            // Calculate additional flat penalty based on 5% p.a. of the EMI
            entry.penalty = (entry.emi * PENALTY_RATE_PA / 365) * entry.daysOverdue;
            
            entry.totalDue = entry.emi + entry.penalInterest + entry.penalty;

        } else {
            entry.status = 'UPCOMING';
        }
    }


    schedule.push(entry);
    balance = entry.endingBalance;
    principalRepaidSoFar += principalComponent;
  }

  return schedule;
};


export const formatCurrency = (amount: number) => {
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
    let principalPaid = 0;
    let interestPaid = 0;
    let penaltyPaid = 0;
    let savingsDeposit = 0;

    const allocation = {
        principal: 0,
        interest: 0, // This will include regular + penal
        penalty: 0,
        savings: 0,
    };

    for (const installment of dueInstallments) {
        if (remainingAmount <= 0) break;

        // 1. Pay Penalty (if not waived)
        if (!waivePenalty && installment.penalty > 0) {
            const amountToPay = Math.min(remainingAmount, installment.penalty);
            allocation.penalty += amountToPay;
            remainingAmount -= amountToPay;
        }

        if (remainingAmount <= 0) break;
        
        // 2. Pay Penal Interest + Regular Interest
        const totalInterestDue = installment.interest + installment.penalInterest;
        if (totalInterestDue > 0) {
            const amountToPay = Math.min(remainingAmount, totalInterestDue);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
        }

        if (remainingAmount <= 0) break;

        // 3. Pay Principal
        if (installment.principal > 0) {
            const amountToPay = Math.min(remainingAmount, installment.principal);
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
