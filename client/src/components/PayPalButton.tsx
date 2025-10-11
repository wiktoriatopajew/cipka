import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  intent?: 'CAPTURE' | 'AUTHORIZE';
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

export default function PayPalButton({
  amount,
  currency = 'USD',
  intent = 'CAPTURE',
  onSuccess,
  onError
}: PayPalButtonProps) {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          PayPal configuration missing. Please contact support.
        </p>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalClientId,
    currency: currency,
    intent: intent,
  };

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
