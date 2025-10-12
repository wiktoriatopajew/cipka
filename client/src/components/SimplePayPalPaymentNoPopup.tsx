import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, CreditCard, ExternalLink } from 'lucide-react';

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

export default function SimplePayPalPaymentNoPopup({
  amount,
  currency = 'USD',
  email,
  onSuccess,
  onError
}: SimplePayPalPaymentProps) {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
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

  const createAndRedirectToPayPal = async () => {
    if (creating) return;
    
    setCreating(true);
    try {
      console.log('🔄 Creating PayPal order (Direct Redirect)...');
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
      
      // Direct redirect to PayPal - NO POPUP
      if (orderData.checkoutUrl) {
        console.log('🔄 Redirecting to PayPal checkout...');
        window.location.href = orderData.checkoutUrl;
      } else {
        // Fallback URL construction
        const fallbackUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
        console.log('🔄 Redirecting to PayPal fallback...');
        window.location.href = fallbackUrl;
      }
      
    } catch (error) {
      console.error('❌ Error creating PayPal order:', error);
      toast({
        title: "PayPal Error",
        description: "Failed to create PayPal order. Please try again.",
        variant: "destructive"
      });
      onError(`PayPal error: ${error}`);
      setCreating(false);
    }
  };

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

      {/* PayPal Direct Payment Button */}
      <div className="border border-gray-200 rounded-lg p-4">
        <Button
          onClick={createAndRedirectToPayPal}
          disabled={creating}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating PayPal Order...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Pay with PayPal
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          You will be redirected to PayPal to complete your payment
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-2">
          <strong>How it works:</strong>
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Click "Pay with PayPal" to go directly to PayPal</li>
          <li>• Complete your payment on PayPal's secure site</li>
          <li>• You'll be redirected back here after payment</li>
          <li>• No popups or additional windows needed</li>
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