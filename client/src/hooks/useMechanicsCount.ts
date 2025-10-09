import { useState, useEffect } from 'react';

// Global state for mechanics count to ensure consistency across components
let globalMechanicsCount = 0;
let globalMechanics: any[] = [];
let lastFetchTime = 0;
const listeners: Set<() => void> = new Set();

// Fetch mechanics data from server
const fetchMechanicsFromServer = async (): Promise<{ mechanics: any[], onlineCount: number } | null> => {
  try {
    const response = await fetch('/api/mechanics');
    if (!response.ok) {
      throw new Error('Failed to fetch mechanics');
    }
    const data = await response.json();
    return {
      mechanics: data.mechanics,
      onlineCount: data.onlineCount
    };
  } catch (error) {
    console.error('Error fetching mechanics:', error);
    return null;
  }
};

// Generate/fetch mechanics count that stays consistent across all users
const generateMechanicsCount = async (): Promise<number> => {
  const now = Date.now();
  const twoMinutes = 2 * 60 * 1000; // Check server every 2 minutes
  
  // Only fetch from server if enough time has passed or no data exists
  if (now - lastFetchTime > twoMinutes || globalMechanicsCount === 0) {
    const data = await fetchMechanicsFromServer();
    
    if (data) {
      globalMechanicsCount = data.onlineCount;
      globalMechanics = data.mechanics;
      lastFetchTime = now;
      
      // Notify all listeners
      listeners.forEach(listener => listener());
    }
  }
  
  return globalMechanicsCount;
};

// Custom hook to get current mechanics count
export const useMechanicsCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const newCount = await generateMechanicsCount();
      setCount(newCount);
    };

    const listener = () => {
      setCount(globalMechanicsCount);
    };

    // Initial fetch
    updateCount();

    // Add this component as a listener
    listeners.add(listener);
    
    // Set up interval to check for updates every 2 minutes
    const interval = setInterval(updateCount, 2 * 60 * 1000);

    // Cleanup
    return () => {
      listeners.delete(listener);
      clearInterval(interval);
    };
  }, []);

  return count;
};

// Export function to get global mechanics list (for OnlineMechanics component)
export const useGlobalMechanics = () => {
  const [mechanics, setMechanics] = useState<any[]>([]);
  
  useEffect(() => {
    const updateMechanics = async () => {
      const data = await fetchMechanicsFromServer();
      if (data) {
        setMechanics(data.mechanics);
      }
    };

    const listener = () => {
      setMechanics(globalMechanics);
    };

    // Initial fetch
    updateMechanics();

    // Add this component as a listener
    listeners.add(listener);
    
    // Always set up interval to check for updates (mechanics should always update)
    const interval = setInterval(updateMechanics, 2 * 60 * 1000);

    // Cleanup
    return () => {
      listeners.delete(listener);
      clearInterval(interval);
    };
  }, []);

  return mechanics;
};