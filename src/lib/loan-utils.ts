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
  
  if (emi === 0 && principal > 0) { // Simplified path for zero interest, can be expanded
    const schedule: AmortizationEntry[] = [];
    const flatPrincipal = principal / termMonths;
    for (let i = 1; i <= termMonths; i++) {
        // This part needs the same dynamic logic as the main path
    }
    return schedule;
  }
  if (emi === 0) return [];


  // 1. Generate static schedule
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
      principalPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
    });
    balance -= principalComponent;
  }
  
  if (schedule.length > 0) {
      const lastEntry = schedule[schedule.length - 1];
      lastEntry.principal += lastEntry.endingBalance;
      lastEntry.emi += lastEntry.endingBalance;
      lastEntry.totalDue += lastEntry.endingBalance;
      lastEntry.endingBalance = 0;
  }

  // 2. Apply repayments and calculate dynamic fields
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedRepayments = [...repayments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

  schedule.forEach(entry => {
    const dueDate = new Date(entry.paymentDate);
    dueDate.setHours(0, 0, 0, 0);

    const paymentsForThisInstallment = sortedRepayments.filter(p => {
        const paymentDate = new Date(p.payment_date);
        paymentDate.setHours(0,0,0,0);
        const previousDueDate = addMonths(dueDate, -1);
        return paymentDate > previousDueDate && paymentDate <= dueDate;
    });

    entry.principalPaid = paymentsForThisInstallment.reduce((acc, p) => acc + p.principal_paid, 0);
    entry.interestPaid = paymentsForThisInstallment.reduce((acc, p) => acc + p.interest_paid, 0);
    entry.penaltyPaid = paymentsForThisInstallment.reduce((acc, p) => acc + p.penalty_paid, 0);
    entry.paidAmount = entry.principalPaid + entry.interestPaid + entry.penaltyPaid;

    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const isDue = isToday(dueDate);

    if (isOverdue || isDue) {
        // Calculate penalty and penal interest if overdue
        if(isOverdue) {
            entry.daysOverdue = differenceInDays(today, dueDate);
            const dailyRate = annualRate / 365 / 100;
            const dailyPenaltyRate = PENALTY_RATE_PA / 365;

            const outstandingEmi = entry.emi - entry.paidAmount;
            if (outstandingEmi > 0) {
                 entry.penalInterest = outstandingEmi * dailyRate * entry.daysOverdue;
                 entry.penalty = outstandingEmi * dailyPenaltyRate * entry.daysOverdue;
            }
        }
        
        const totalInstallmentCost = entry.emi + entry.penalInterest + entry.penalty;

        if (entry.paidAmount >= totalInstallmentCost) {
            entry.status = 'PAID';
            entry.totalDue = 0;
        } else {
            entry.status = isOverdue ? 'OVERDUE' : 'DUE';
            entry.totalDue = totalInstallmentCost - entry.paidAmount;
        }

    } else { // Upcoming
        if (entry.paidAmount >= entry.emi) {
            entry.status = 'PAID';
            entry.totalDue = 0;
        } else {
            entry.status = 'UPCOMING';
            entry.totalDue = entry.emi - entry.paidAmount;
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

    const sortedDues = [...dueInstallments].sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const installment of sortedDues) {
        if (remainingAmount <= 0) break;

        const duePenalty = (installment.penalty + installment.penalInterest) - installment.penaltyPaid;
        const dueInterest = installment.interest - installment.interestPaid;
        const duePrincipal = installment.principal - installment.principalPaid;

        // 1. Pay Penalty (if not waived)
        if (!waivePenalty && duePenalty > 0) {
            const amountToPay = Math.min(remainingAmount, duePenalty);
            allocation.penalty += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;
        
        // 2. Pay Interest
        if (dueInterest > 0) {
            const amountToPay = Math.min(remainingAmount, dueInterest);
            allocation.interest += amountToPay;
            remainingAmount -= amountToPay;
        }
        if (remainingAmount <= 0) break;

        // 3. Pay Principal
        if (duePrincipal > 0) {
            const amountToPay = Math.min(remainingAmount, duePrincipal);
            allocation.principal += amountToPay;
            remainingAmount -= amountToPay;
        }
    }

    if (remainingAmount > 0) {
        allocation.savings = remainingAmount;
    }

    return allocation;
};
