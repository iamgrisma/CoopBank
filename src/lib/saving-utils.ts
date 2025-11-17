import { differenceInDays, endOfQuarter, startOfQuarter, isBefore, addDays } from "date-fns";

type Saving = {
    amount: number;
    deposit_date: string;
    saving_schemes: {
        interest_rate: number;
        type: string;
    } | null;
};

const FINANCIAL_QUARTERS = {
    Q1: { endMonth: 2, endDate: 31 }, // March 31
    Q2: { endMonth: 5, endDate: 30 }, // June 30
    Q3: { endMonth: 8, endDate: 30 }, // September 30
    Q4: { endMonth: 11, endDate: 31 },// December 31
}

/**
 * Calculates the total accrued interest for a list of saving deposits.
 * Accrued interest is simple interest calculated daily but not yet paid out.
 * @param savings - An array of saving objects.
 * @returns The total accrued interest as a number.
 */
export function calculateAccruedInterestForAllSavings(savings: Saving[]): number {
    let totalAccruedInterest = 0;
    const today = new Date();

    // Find the start date of the current quarter
    const currentQuarterStart = startOfQuarter(today);

    for (const saving of savings) {
        if (!saving.saving_schemes || saving.saving_schemes.type === 'Current' || saving.saving_schemes.interest_rate <= 0) {
            continue;
        }

        const depositDate = new Date(saving.deposit_date);
        const annualRate = saving.saving_schemes.interest_rate;
        const dailyRate = annualRate / 100 / 365;

        // Interest calculation starts from the later of the deposit date or the start of the current quarter.
        const interestStartDate = isBefore(depositDate, currentQuarterStart)
            ? currentQuarterStart
            : depositDate;
        
        // Only calculate interest if the start date is before today
        if (isBefore(interestStartDate, today)) {
             // add 1 to include the start day in calculation
            const daysToCalculate = differenceInDays(today, interestStartDate) + 1;
            const accruedInterest = saving.amount * dailyRate * daysToCalculate;
            totalAccruedInterest += accruedInterest;
        }
    }

    return totalAccruedInterest;
}
