import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, CreditCard } from 'lucide-react';

interface PayPalConfig {
  clientId: string;
  mode: string;
}

interface SimplePayPalPaymentProps {
  amount: number;
  currency?: string;
  email: string;
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: string) => void;
}

export default function SimplePayPalPayment({
  amount,
  currency = 'USD',
  email,
  onSuccess,
  onError
}: SimplePayPalPaymentProps) {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch PayPal config from backend
    fetch('/api/paypal-config')
      .then(response => {
        if (!response.ok) {
          throw new Error('PayPal not configured');
        }
        return response.json();
      })
      .then((config: PayPalConfig) => {
        console.log('✅ PayPal config loaded:', { 
          clientId: config.clientId.substring(0, 20) + '...', 
          mode: config.mode 
        });
        setPaypalConfig(config);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Failed to load PayPal config:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  if (error || !paypalConfig) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm font-medium">
          PayPal Unavailable
        </p>
        <p className="text-red-500 text-xs mt-1">
          {error || 'Configuration not available'}
        </p>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalConfig.clientId,
    currency: currency,
    intent: 'capture'
  };

  console.log('🔍 PayPal SDK initializing with:', {
    clientId: paypalConfig.clientId.substring(0, 20) + '...',
    currency,
    amount
  });

  return (
    <div className="space-y-4">
      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">PayPal Payment</span>
          </div>
          <span className="text-lg font-semibold text-blue-900">
            ${amount.toFixed(2)} {currency}
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Email: {email}
        </p>
      </div>

      {/* PayPal Buttons */}
      <PayPalScriptProvider options={initialOptions}>
        <div className="border border-gray-200 rounded-lg p-4">
          <PayPalButtons
            forceReRender={[amount, currency]}
            createOrder={async (data, actions) => {
              console.log('🔄 Creating PayPal order...');
              try {
                const response = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount: amount.toString(),
                    currency: currency,
                    intent: 'CAPTURE',
                    email: email
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to create order');
                }

                const orderData = await response.json();
                console.log('✅ PayPal order created:', orderData.id);
                
                // Store checkout URL as fallback for popup blockers
                if (orderData.checkoutUrl) {
                  setCheckoutUrl(orderData.checkoutUrl);
                }
                
                return orderData.id;
              } catch (error) {
                console.error('❌ Error creating order:', error);
                toast({
                  title: "Payment Error",
                  description: "Failed to initialize payment. Please try again.",
                  variant: "destructive"
                });
                throw error;
              }
            }}
            onApprove={async (data, actions) => {
              console.log('🔄 Capturing PayPal payment...');
              try {
                const response = await fetch(`/api/paypal/capture-order/${data.orderID}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!response.ok) {
                  throw new Error('Failed to capture payment');
                }

                const result = await response.json();
                console.log('✅ PayPal payment captured:', result);

                toast({
                  title: "Payment Successful!",
                  description: "Your PayPal payment has been processed.",
                  variant: "default"
                });

                // Clear checkout URL on success
                setCheckoutUrl(null);
                onSuccess(data.orderID);
              } catch (error) {
                console.error('❌ Error capturing payment:', error);
                toast({
                  title: "Payment Error",
                  description: "Failed to process payment. Please try again.",
                  variant: "destructive"
                });
                onError('Payment capture failed');
              }
            }}
            onError={(error) => {
              console.error('❌ PayPal error:', error);
              
              // Handle popup blocker specifically
              if (error && typeof error === 'object' && 
                  ('popup' in error || 'blocked' in error || 
                   (error.toString && error.toString().includes('blocked')))) {
                toast({
                  title: "Popup Blocked",
                  description: "Please allow popups or use the manual payment link below.",
                  variant: "destructive"
                });
              } else {
                toast({
                  title: "PayPal Error",
                  description: "An error occurred. Please try again.",
                  variant: "destructive"
                });
              }
              
              onError(`PayPal error: ${error}`);
            }}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              tagline: false
            }}
          />
          
          {/* Manual Payment Button - Alternative to PayPal Buttons */}
          <div className="mt-4">
            <div className="text-center text-sm text-gray-500 mb-2">or</div>
            <Button
              onClick={async () => {
                try {
                  console.log('🔄 Creating manual PayPal order...');
                  const response = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amount: amount.toString(),
                      currency: currency,
                      intent: 'CAPTURE',
                      email: email
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to create order');
                  }

                  const orderData = await response.json();
                  console.log('✅ Manual PayPal order created:', orderData.id);
                  
                  // Open PayPal checkout immediately 
                  if (orderData.checkoutUrl) {
                    window.location.href = orderData.checkoutUrl;
                  } else {
                    // Fallback URL construction
                    const fallbackUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
                    window.location.href = fallbackUrl;
                  }
                } catch (error) {
                  console.error('❌ Error creating manual order:', error);
                  toast({
                    title: "Payment Error",
                    description: "Failed to create PayPal order. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              variant="outline"
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Pay with PayPal (Direct)
            </Button>
          </div>
          
          {/* Popup Blocker Fallback */}
          {checkoutUrl && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                <strong>Popup blocked?</strong> Click the button below to complete your payment:
              </p>
              <Button
                onClick={() => {
                  window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Continue to PayPal
              </Button>
              <p className="text-xs text-yellow-600 mt-2">
                This will open PayPal in a new tab
              </p>
            </div>
          )}
        </div>
      </PayPalScriptProvider>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Having trouble with payment?</strong>
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• If popups are blocked, use the "Pay with PayPal (Direct)" button</li>
          <li>• Make sure JavaScript is enabled in your browser</li>
          <li>• Try refreshing the page if buttons don't load</li>
        </ul>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <Lock className="h-3 w-3" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
}