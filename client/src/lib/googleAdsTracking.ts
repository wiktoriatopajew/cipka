// Google Ads Conversion Tracking Utility
// This file automatically loads configuration from the admin panel

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface ConversionData {
  transactionId: string;
  value: number;
  currency: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

interface GoogleAdsConfigResponse {
  enabled: boolean;
  conversionId?: string;
  purchaseLabel?: string;
  signupLabel?: string;
}

export class GoogleAdsConversions {
  private static config: GoogleAdsConfigResponse | null = null;
  private static configLoaded = false;

  /**
   * Load Google Ads configuration from API
   */
  private static async loadConfig(): Promise<GoogleAdsConfigResponse> {
    if (this.configLoaded && this.config) {
      return this.config;
    }

    try {
      const response = await fetch('/api/google-ads-config');
      const config = await response.json();
      this.config = config;
      this.configLoaded = true;
      
      console.log('🎯 Google Ads config loaded:', config.enabled ? 'ENABLED' : 'DISABLED');
      return config;
    } catch (error) {
      console.error('❌ Failed to load Google Ads config:', error);
      this.config = { enabled: false };
      this.configLoaded = true;
      return this.config;
    }
  }

  /**
   * Check if tracking is enabled and config is valid for purchase tracking
   */
  private static async isTrackingEnabled(): Promise<boolean> {
    const config = await this.loadConfig();
    return config.enabled && !!config.conversionId && !!config.purchaseLabel;
  }

  /**
   * Track a purchase conversion
   * Call this when a user successfully completes a payment
   */
  static async trackPurchase(data: ConversionData) {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const isEnabled = await this.isTrackingEnabled();
      if (!isEnabled) {
        console.log('⏭️ Google Ads tracking disabled - skipping purchase tracking');
        return;
      }

      const config = this.config!;

      // Enhanced conversion tracking for purchases
      window.gtag('event', 'conversion', {
        'send_to': `${config.conversionId}/${config.purchaseLabel}`,
        'value': data.value,
        'currency': data.currency,
        'transaction_id': data.transactionId,
        'items': data.items || [{
          item_id: data.transactionId,
          item_name: 'Mechanic Consultation Subscription',
          category: 'Automotive Services',
          quantity: 1,
          price: data.value
        }]
      });

      // Also track as a purchase event for Google Analytics
      window.gtag('event', 'purchase', {
        'transaction_id': data.transactionId,
        'value': data.value,
        'currency': data.currency,
        'items': data.items || [{
          item_id: data.transactionId,
          item_name: 'Mechanic Consultation Subscription',
          category: 'Automotive Services',
          quantity: 1,
          price: data.value
        }]
      });

      console.log('✅ Google Ads purchase conversion tracked:', data);
    } catch (error) {
      console.error('❌ Failed to track Google Ads purchase conversion:', error);
    }
  }

  /**
   * Track a signup conversion
   * Call this when a user successfully registers
   */
  static async trackSignup(email?: string) {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const isEnabled = await this.isTrackingEnabled();
      if (!isEnabled) {
        console.log('⏭️ Google Ads tracking disabled - skipping signup tracking');
        return;
      }

      const config = this.config!;

      window.gtag('event', 'conversion', {
        'send_to': `${config.conversionId}/${config.signupLabel}`,
        'email': email
      });

      // Also track as a sign_up event
      window.gtag('event', 'sign_up', {
        'method': 'email'
      });

      console.log('✅ Google Ads signup conversion tracked');
    } catch (error) {
      console.error('❌ Failed to track Google Ads signup conversion:', error);
    }
  }

  /**
   * Track when user starts checkout process
   */
  static async trackBeginCheckout(value: number, currency: string = 'USD') {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const isEnabled = await this.isTrackingEnabled();
      if (!isEnabled) {
        console.log('⏭️ Google Ads tracking disabled - skipping begin_checkout tracking');
        return;
      }

      window.gtag('event', 'begin_checkout', {
        'currency': currency,
        'value': value
      });

      console.log('✅ Google Ads begin_checkout tracked');
    } catch (error) {
      console.error('❌ Failed to track Google Ads begin_checkout:', error);
    }
  }

  /**
   * Track when user adds payment info
   */
  static async trackAddPaymentInfo(value: number, currency: string = 'USD') {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const isEnabled = await this.isTrackingEnabled();
      if (!isEnabled) {
        console.log('⏭️ Google Ads tracking disabled - skipping add_payment_info tracking');
        return;
      }

      window.gtag('event', 'add_payment_info', {
        'currency': currency,
        'value': value
      });

      console.log('✅ Google Ads add_payment_info tracked');
    } catch (error) {
      console.error('❌ Failed to track Google Ads add_payment_info:', error);
    }
  }

  /**
   * Track page views (useful for remarketing)
   */
  static async trackPageView(pagePath?: string) {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const config = await this.loadConfig();
      if (!config.enabled || !config.conversionId) {
        console.log('⏭️ Google Ads tracking disabled - skipping page view tracking');
        return;
      }

      window.gtag('config', config.conversionId, {
        'page_path': pagePath || window.location.pathname
      });

      console.log('✅ Google Ads page view tracked:', pagePath || window.location.pathname);
    } catch (error) {
      console.error('❌ Failed to track Google Ads page view:', error);
    }
  }

  /**
   * Track custom events
   */
  static async trackCustomEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
      const isEnabled = await this.isTrackingEnabled();
      if (!isEnabled) {
        console.log(`⏭️ Google Ads tracking disabled - skipping custom event: ${eventName}`);
        return;
      }

      window.gtag('event', eventName, parameters);

      console.log(`✅ Google Ads custom event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error(`❌ Failed to track Google Ads custom event: ${eventName}`, error);
    }
  }

  /**
   * Test Google Ads tracking (for admin panel)
   */
  static async testTracking(): Promise<{ success: boolean; message: string }> {
    try {
      const config = await this.loadConfig();
      
      if (!config.enabled) {
        return { success: false, message: 'Google Ads tracking is disabled' };
      }

      if (!config.conversionId || !config.purchaseLabel || !config.signupLabel) {
        return { success: false, message: 'Google Ads configuration is incomplete' };
      }

      if (typeof window === 'undefined' || !window.gtag) {
        return { success: false, message: 'Google Tag Manager not loaded' };
      }

      // Send test conversion
      window.gtag('event', 'conversion', {
        'send_to': `${config.conversionId}/${config.purchaseLabel}`,
        'value': 1.00,
        'currency': 'USD',
        'transaction_id': `test-${Date.now()}`,
        'debug_mode': true
      });

      return { success: true, message: 'Test conversion sent successfully' };
    } catch (error) {
      return { success: false, message: `Test failed: ${error}` };
    }
  }
}

// Export plan price mapping for easy tracking
export const PLAN_PRICES = {
  'basic': 14.99,
  'professional': 49.99,
  'expert': 79.99
} as const;

export type PlanType = keyof typeof PLAN_PRICES;