import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Lock, Shield } from 'lucide-react';

// Initialize Stripe outside of component to avoid recreating
// Dynamic Stripe Promise that fetches key from API
const getStripePromise = async () => {
  try {
    const response = await fetch('/api/stripe-config');
    const config = await response.json();
    
    if (config.publishableKey) {
      return loadStripe(config.publishableKey);
    }
    
    // Fallback to environment variable
    return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);
  } catch (error) {
    console.error('Error loading Stripe config:', error);
    // Fallback to environment variable
    return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);
  }
};

const stripePromise = getStripePromise();

// Card Element styling - modern and beautiful
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1a1a1a',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
      '::placeholder': {
        color: '#9ca3af',
        fontWeight: '400'
      },
      ':focus': {
        color: '#1a1a1a'
      },
      ':hover': {
        color: '#1a1a1a'
      },
      iconColor: '#6b7280'
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
      ':focus': {
        color: '#ef4444'
      }
    },
    complete: {
      color: '#10b981',
      iconColor: '#10b981'
    }
  },
  hidePostalCode: true
};

interface CheckoutFormProps {
  amount: number;
  email: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, email, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Create payment intent when component mounts
  useEffect(() => {
    apiRequest('POST', '/api/create-payment-intent', { amount })
      .then(res => res.json())
      .then(data => {
        setClientSecret(data.clientSecret);
      })
      .catch(err => {
        console.error('Failed to create payment intent:', err);
        onError('Failed to initialize payment');
      });
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.error('Stripe not ready:', { stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret });
      return;
    }

    setIsProcessing(true);

    const card = elements.getElement(CardElement);
    if (!card) {
      console.error('Card element not found');
      setIsProcessing(false);
      return;
    }

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          email: email,
        },
      }
    });

    setIsProcessing(false);

    if (error) {
      console.error('Payment failed:', error);
      onError(error.message || 'Payment failed');
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed.",
      });
      onSuccess(paymentIntent.id);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Initializing payment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <CreditCard className="w-4 h-4 mr-2" />
              Card Information
            </label>
            <div className="relative border border-gray-300 rounded-lg p-4 bg-white hover:border-gray-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" />
              Pay ${amount}
            </div>
          )}
        </Button>
      </form>
      
      <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <Shield className="w-4 h-4 mr-2" />
        <span>Secured by Stripe • Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
}

interface SimpleStripePaymentProps {
  amount: number;
  email: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function SimpleStripePayment({ amount, email, onSuccess, onError }: SimpleStripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        email={email} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
}