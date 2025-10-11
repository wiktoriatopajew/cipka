import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  intent?: 'CAPTURE' | 'AUTHORIZE';
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

interface PayPalConfig {
  clientId: string;
  mode: string;
}

export default function PayPalButton({
  amount,
  currency = 'USD',
  intent = 'CAPTURE',
  onSuccess,
  onError
}: PayPalButtonProps) {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('✅ PayPal config loaded:', { clientId: config.clientId.substring(0, 20) + '...', mode: config.mode });
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
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">Loading PayPal...</p>
      </div>
    );
  }

  if (error || !paypalConfig) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          PayPal configuration error: {error || 'Configuration not available'}
        </p>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalConfig.clientId,
    currency: currency,
    intent: intent,
    // Use sandbox environment for testing
    'data-sdk-integration-source': 'integrationbuilder_sc',
  };

  console.log('PayPal SDK Options:', initialOptions);

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ 
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: intent as "CAPTURE" | "AUTHORIZE",
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: amount,
                },
                description: `AutoMentor Subscription - $${amount}`,
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            // Capture the payment on PayPal side
            const details = await actions.order?.capture();
            console.log('PayPal payment captured:', details);
            
            // Call our success handler with the order details
            onSuccess({
              id: data.orderID,
              details: details,
              payerID: data.payerID
            });
          } catch (error) {
            console.error('PayPal capture error:', error);
            onError(error);
          }
        }}
        onError={(error) => {
          console.error('PayPal button error:', error);
          onError(error);
        }}
        onCancel={(data) => {
          console.log('PayPal payment cancelled:', data);
          onError('Payment was cancelled');
        }}
      />
    </PayPalScriptProvider>
  );
}
