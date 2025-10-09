import { useMemo } from 'react';

// Base date when the app started (can be adjusted)
const BASE_DATE = new Date('2024-01-01');
const BASE_PROBLEMS_SOLVED = 8000; // Starting number of problems solved
const BASE_HAPPY_CUSTOMERS = 7200; // Starting number of happy customers (90% of problems solved)

// Generate realistic daily growth with variation
function getDailyCustomersGrowth(dayIndex: number): number {
  // Use dayIndex as seed for consistent but varied daily growth (3-5 customers per day)
  const seed = (dayIndex * 9301 + 49297) % 233280; // Simple PRNG
  const normalized = seed / 233280; // 0-1
  return Math.floor(normalized * 3) + 3; // 3-5 customers per day
}

function getDailyProblemsGrowth(dayIndex: number): number {
  // Slightly higher than customers (4-6 problems per day)
  const seed = (dayIndex * 7919 + 31397) % 233280; 
  const normalized = seed / 233280;
  return Math.floor(normalized * 3) + 4; // 4-6 problems per day
}

export function useDynamicStats() {
  return useMemo(() => {
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate cumulative growth with daily variation
    let totalProblemsGrowth = 0;
    let totalCustomersGrowth = 0;
    
    for (let day = 0; day < daysSinceStart; day++) {
      totalProblemsGrowth += getDailyProblemsGrowth(day);
      totalCustomersGrowth += getDailyCustomersGrowth(day);
    }
    
    const problemsSolved = BASE_PROBLEMS_SOLVED + totalProblemsGrowth;
    const happyCustomers = BASE_HAPPY_CUSTOMERS + totalCustomersGrowth;
    
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