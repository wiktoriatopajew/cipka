import { useMemo } from 'react';

// Base date when the app started (can be adjusted)
const BASE_DATE = new Date('2024-01-01');
const BASE_PROBLEMS_SOLVED = 8000; // Starting number of problems solved
const BASE_HAPPY_CUSTOMERS = 7200; // Starting number of happy customers (90% of problems solved)

// Daily growth rates
const DAILY_PROBLEMS_GROWTH = 32; // About 32 problems solved per day
const DAILY_CUSTOMERS_GROWTH = 28; // About 28 new happy customers per day (slightly less than problems)

export function useDynamicStats() {
  return useMemo(() => {
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
    
    const problemsSolved = BASE_PROBLEMS_SOLVED + (daysSinceStart * DAILY_PROBLEMS_GROWTH);
    const happyCustomers = BASE_HAPPY_CUSTOMERS + (daysSinceStart * DAILY_CUSTOMERS_GROWTH);
    
    // Format numbers with commas and add + for problems solved
    const formatNumber = (num: number) => {
      return num.toLocaleString();
    };
    
    return {
      problemsSolved: `${formatNumber(problemsSolved)}+`,
      happyCustomers: formatNumber(happyCustomers),
      rawProblemsSolved: problemsSolved,
      rawHappyCustomers: happyCustomers
    };
  }, []);
}