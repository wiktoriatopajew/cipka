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

// Initialize Stripe outside of component to avoid recreating
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51NSmbFEqdkqBXQdX4uoBQAu2Y0Uk8RyulN1hXl8iJnMv3w6MVHUvy3T8usJoJNkZ6QB9AtwJtm0IgTZo5muaDFuC00Zc2YiOWp');

// Card Element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#fa755a'
    }
  }
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
    console.log('Creating payment intent for amount:', amount);
    
    apiRequest('POST', '/api/create-payment-intent', { amount })
      .then(res => res.json())
      .then(data => {
        console.log('Payment intent created:', data.clientSecret?.substring(0, 20) + '...');
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
    console.log('Processing payment...');

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
      console.log('Payment succeeded:', paymentIntent.id);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <label className="block text-sm font-medium mb-2">
          Card Information
        </label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
        <div className="text-xs text-muted-foreground mt-2">
          Test card: 4242 4242 4242 4242, 12/25, 123
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
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