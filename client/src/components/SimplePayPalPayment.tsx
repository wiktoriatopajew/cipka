import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock } from 'lucide-react';

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
        console.log('✅ PayPal config loaded for payment:', { 
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
      <div className="space-y-4">
        <div className="p-6 border border-gray-200 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Loading PayPal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paypalConfig) {
    return (
      <div className="space-y-4">
        <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-600 text-sm font-medium">
            PayPal Unavailable
          </p>
          <p className="text-red-500 text-xs mt-1">
            {error || 'Configuration not available'}
          </p>
        </div>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalConfig.clientId,
    currency: currency,
    intent: 'capture',
    // Simplified options for better compatibility
    components: 'buttons'
  };

  console.log('🔍 PayPal SDK Options:', initialOptions);

  return (
    <div className="space-y-6">
      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Secure PayPal Payment</h3>
            <p className="text-xs text-blue-700 mt-1">
              Your payment is processed securely through PayPal's encrypted servers
            </p>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Amount:</span>
          <span className="text-lg font-semibold text-gray-900">
            ${amount.toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">Email:</span>
          <span className="text-sm text-gray-900">{email}</span>
        </div>
      </div>

      {/* PayPal Buttons */}
      <PayPalScriptProvider options={initialOptions}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div style={{ minHeight: '45px' }}>
            <PayPalButtons
              style={{
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
              }}
            createOrder={async (data, actions) => {
              try {
                console.log('🔄 Creating PayPal order for amount:', amount);
                
                // Create order on backend
                const response = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount: amount.toString(),
                    currency: currency,
                    email: email
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to create PayPal order');
                }

                const orderData = await response.json();
                console.log('✅ PayPal order created:', orderData.id);
                return orderData.id;
              } catch (error) {
                console.error('❌ Error creating PayPal order:', error);
                toast({
                  title: "Payment Error",
                  description: "Failed to initialize PayPal payment. Please try again.",
                  variant: "destructive"
                });
                onError('Failed to create PayPal order');
                throw error;
              }
            }}
            onApprove={async (data, actions) => {
              try {
                console.log('🔄 Capturing PayPal order:', data.orderID);
                
                // Capture payment on backend
                const response = await fetch(`/api/paypal/capture-order/${data.orderID}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!response.ok) {
                  throw new Error('Failed to capture PayPal payment');
                }

                const captureData = await response.json();
                console.log('✅ PayPal payment captured:', captureData);

                toast({
                  title: "Payment Successful",
                  description: "Your PayPal payment has been processed successfully!",
                  variant: "default"
                });

                // Return the order ID to parent component for user creation
                onSuccess(data.orderID);
              } catch (error) {
                console.error('❌ Error capturing PayPal payment:', error);
                toast({
                  title: "Payment Error",
                  description: "Failed to process PayPal payment. Please try again.",
                  variant: "destructive"
                });
                onError('Failed to capture PayPal payment');
              }
            }}
            onError={(error) => {
              console.error('❌ PayPal button error:', error);
              toast({
                title: "PayPal Error",
                description: "An error occurred with PayPal. Please try again or use a different payment method.",
                variant: "destructive"
              });
              onError(`PayPal error: ${error.message || 'Unknown error'}`);
            }}
            />
          </div>
        </div>
      </PayPalScriptProvider>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Lock className="h-3 w-3" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>PayPal Protected</span>
        </div>
      </div>
    </div>
  );
}