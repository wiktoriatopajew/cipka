import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PaymentSuccessProps {
  source?: string;
  token?: string;
  PayerID?: string;
}

export default function PaymentSuccess() {
  const [location, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');
  const token = urlParams.get('token'); // PayPal order ID
  const payerId = urlParams.get('PayerID');

  useEffect(() => {
    // Auto-capture PayPal payment if token is present
    if (source === 'paypal' && token && payerId && !processing && !success && !error) {
      capturePayPalPayment();
    }
  }, [source, token, payerId, processing, success, error]);

  const capturePayPalPayment = async () => {
    setProcessing(true);
    try {
      console.log('🔄 Capturing PayPal payment...', { token, payerId });
      
      const response = await fetch(`/api/paypal/capture-order/${token}`, {
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
      
      // Check if we have payment context for user creation
      const paymentContext = localStorage.getItem('paypal-payment-context');
      if (paymentContext) {
        try {
          const context = JSON.parse(paymentContext);
          console.log('🔍 Found PayPal payment context:', context);
          
          // Store payment data for user creation process
          const paymentData = {
            paymentId: token,
            paymentMethod: 'paypal',
            amount: context.amount,
            email: context.email,
            currency: context.currency || 'USD'
          };
          
          localStorage.setItem('payment-data', JSON.stringify(paymentData));
          localStorage.removeItem('paypal-payment-context'); // Clean up
          
          console.log('🔄 Redirecting to user creation...');
          
          // Redirect to home with payment success flag - this should trigger user creation modal
          setLocation('/?payment=success&source=paypal');
          return;
        } catch (error) {
          console.error('❌ Error parsing payment context:', error);
        }
      }
      
      // Default behavior - show success and redirect to home
      setSuccess(true);
      setTimeout(() => {
        setLocation('/');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error capturing PayPal payment:', error);
      setError('Failed to process payment. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-6">
            
            {/* Processing State */}
            {processing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold text-blue-900 mb-2">
                  Processing Your Payment
                </h1>
                <p className="text-blue-700">
                  Please wait while we confirm your payment with PayPal...
                </p>
              </div>
            )}

            {/* Success State */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-green-700 mb-4">
                  Thank you for your payment. Your transaction has been completed successfully.
                </p>
                <p className="text-sm text-green-600">
                  You will be redirected to the home page in a few seconds...
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="mt-4"
                >
                  Continue to Home
                </Button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-900 mb-2">
                  Payment Error
                </h1>
                <p className="text-red-700 mb-4">
                  {error}
                </p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => setLocation('/')}
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            )}

            {/* Default State (no PayPal parameters) */}
            {!processing && !success && !error && source !== 'paypal' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Completed
                </h1>
                <p className="text-gray-700 mb-4">
                  Your payment has been processed successfully.
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                >
                  Continue to Home
                </Button>
              </div>
            )}

            {/* Payment Details */}
            {token && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Payment ID:</strong> {token}</p>
                  {payerId && <p><strong>Payer ID:</strong> {payerId}</p>}
                  <p><strong>Source:</strong> {source}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}