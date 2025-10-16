import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface PageViewData {
  pageUrl: string;
  referrer: string;
  userAgent: string;
}

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view whenever location changes
    const trackPageView = async () => {
      try {
        const data: PageViewData = {
          pageUrl: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        };

        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Silent fail - don't break the app if tracking fails
        console.debug('Page tracking error:', error);
      }
    };

    trackPageView();
  }, [location]);
}
