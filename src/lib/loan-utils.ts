import { addMonths, format } from "date-fns";

export type AmortizationEntry = {
  month: number;
  paymentDate: string;
  beginningBalance: number;
  emi: number;
  principal: number;
  interest: number;
  endingBalance: number;
};

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

export const generateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number,
  disbursementDate: Date
): AmortizationEntry[] => {
  const emi = calculateEMI(principal, annualRate, termMonths);
  if (emi === 0) return [];

  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    const endingBalance = balance - principalPaid;

    schedule.push({
      month: i,
      paymentDate: format(addMonths(disbursementDate, i), "do MMM, yyyy"),
      beginningBalance: balance,
      emi: emi,
      principal: principalPaid,
      interest: interest,
      endingBalance: endingBalance,
    });

    balance = endingBalance;
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
