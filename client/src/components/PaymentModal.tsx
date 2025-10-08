import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Clock, CheckCircle, Star, User, Key } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PayPalButton from "@/components/PayPalButton";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { GoogleAdsConversions, PLAN_PRICES, PlanType } from "@/lib/googleAdsTracking";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (user: { id: string; name: string; email: string; sessionId: string }) => void;
  vehicleInfo?: any;
  selectedPlan?: 'basic' | 'professional' | 'expert';
  referralCode?: string;
  user?: any; // Add user prop
}

// Stripe Checkout Form Component - reference: blueprint:javascript_stripe
function StripeCheckoutForm({ onSuccess, email, currentPrice }: { onSuccess: (paymentIntentId: string) => void, email: string, currentPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe or elements not loaded");
      return;
    }

    console.log("Starting Stripe payment confirmation...");
    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    console.log("Stripe confirmPayment result:", { error, paymentIntent });
    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.id) {
      toast({
        title: "Payment successful!",
        description: "Now create your account",
      });
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-pay"
      >
        {isProcessing ? "Processing..." : `Pay $${currentPrice}`}
      </Button>
    </form>
  );
}

export default function PaymentModal({ open, onOpenChange, onPaymentSuccess, vehicleInfo, selectedPlan = 'basic', referralCode = '', user }: PaymentModalProps) {
  console.log('PaymentModal received vehicleInfo:', vehicleInfo);
  console.log('PaymentModal received user:', user);
  
  // Check if user is logged in
  const isLoggedIn = user && user.id;
  
  const [step, setStep] = useState("payment");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [clientSecret, setClientSecret] = useState("");
  const [email, setEmail] = useState(isLoggedIn ? user.email || "" : "");
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string>("");
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState<'basic' | 'professional' | 'expert'>(selectedPlan);

  // Get price based on selected plan
  const getPlanPrice = (plan: string, hasReferralDiscount = false) => {
    let basePrice;
    switch (plan) {
      case 'basic': basePrice = 14.99; break;
      case 'professional': basePrice = 49.99; break;
      case 'expert': basePrice = 79.99; break;
      default: basePrice = 14.99; break;
    }
    
    // Apply 10% discount for referral users
    if (hasReferralDiscount) {
      return Math.round(basePrice * 0.9 * 100) / 100; // 10% off, rounded to 2 decimals
    }
    
    return basePrice;
  };

  // Get plan details
  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'basic':
        return {
          name: 'Basic Plan',
          duration: '1 day access',
          features: ['1 day of chat access', 'Chat with certified mechanics', 'All vehicle types supported', 'Photo upload support', 'Quick help & tips']
        };
      case 'professional':
        return {
          name: 'Professional Plan',
          duration: '30 days unlimited',
          features: ['Priority chat support', 'Faster response times', 'All vehicle types supported', 'Photo & document upload']
        };
      case 'expert':
        return {
          name: 'Expert Plan',
          duration: '360 days access',
          features: ['Dedicated expert consultations', '24/7 priority support', 'Advanced diagnostics', 'Technical documentation access']
        };
      default:
        return {
          name: 'Basic Plan',
          duration: '1 day access',
          features: ['1 day of chat access', 'Chat with certified mechanics', 'All vehicle types supported', 'Photo upload support', 'Quick help & tips']
        };
    }
  };

  const hasReferralDiscount = !!(referralCode && referralCode.trim() !== '');
  const currentPrice = getPlanPrice(currentSelectedPlan, hasReferralDiscount);
  const originalPrice = getPlanPrice(currentSelectedPlan, false);
  const planDetails = getPlanDetails(currentSelectedPlan);

  // Initialize Stripe from global window.Stripe
  useEffect(() => {
    // Try to get Stripe public key from window object first (set by Vite)
    const stripePublicKey = (window as any).__VITE_STRIPE_PUBLIC_KEY__ || 'pk_test_51NSmbFEqdkqBXQdX4uoBQAu2Y0Uk8RyulN1hXl8iJnMv3w6MVHUvy3T8usJoJNkZ6QB9AtwJtm0IgTZo5muaDFuC00Zc2YiOWp';
    console.log('VITE_STRIPE_PUBLIC_KEY:', stripePublicKey);
    console.log('window.Stripe:', (window as any).Stripe);
    
    if (stripePublicKey && (window as any).Stripe) {
      const stripe = (window as any).Stripe(stripePublicKey);
      setStripeInstance(stripe);
      console.log('Stripe initialized in frontend');
    } else {
      console.log('Stripe NOT initialized:', { 
        hasKey: !!stripePublicKey, 
        hasStripe: !!(window as any).Stripe 
      });
    }
  }, []);
  
  // Account setup fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userInputReferralCode, setUserInputReferralCode] = useState("");
  
  const { toast } = useToast();

  // Set initial referral code from prop
  useEffect(() => {
    if (referralCode) {
      setUserInputReferralCode(referralCode);
    }
  }, [referralCode]);
  
  // Set initial selected plan when modal opens (but don't override user's choice during process)
  useEffect(() => {
    if (open && selectedPlan && step === "payment") {
      setCurrentSelectedPlan(selectedPlan);
      
      // Track begin_checkout when modal opens
      const price = getPlanPrice(selectedPlan, !!referralCode);
      GoogleAdsConversions.trackBeginCheckout(price);
    }
  }, [open]); // Only depend on 'open' to avoid resetting during process

  // Create user and subscription mutation with payment verification
  const createAccountMutation = useMutation({
    mutationFn: async (accountData: { username: string; email: string; password: string; paymentId: string; paymentMethod: string; referralCode?: string }) => {
      try {
        // Create user account
        const userResponse = await apiRequest("POST", "/api/users/register", {
          username: accountData.username,
          email: accountData.email,
          password: accountData.password,
          referralCode: accountData.referralCode
        });
        const user = await userResponse.json();
        
        // Verify payment and create subscription - SECURE
        const verifyPayload = accountData.paymentMethod === "stripe" 
          ? { paymentIntentId: accountData.paymentId, paymentMethod: "stripe", amount: currentPrice }
          : { paypalOrderId: accountData.paymentId, paymentMethod: "paypal", amount: currentPrice };
          
        const subscriptionResponse = await apiRequest("POST", "/api/verify-payment-and-subscribe", verifyPayload);
        await subscriptionResponse.json();
        
        // Create chat session - backend uses session.userId  
        const sessionResponse = await apiRequest("POST", "/api/chat/sessions", {
          vehicleInfo: vehicleInfo || {}
        });
        const session = await sessionResponse.json();
        
        return { user: user, sessionId: session.id };
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const planDetails = getPlanDetails(currentSelectedPlan);
      const price = getPlanPrice(currentSelectedPlan, !!referralCode);
      
      // Track successful conversion in Google Ads
      GoogleAdsConversions.trackPurchase({
        transactionId: paymentId || data.sessionId,
        value: price,
        currency: 'USD',
        items: [{
          item_id: currentSelectedPlan,
          item_name: planDetails.name,
          category: 'Automotive Services',
          quantity: 1,
          price: price
        }]
      });

      // Track signup conversion
      GoogleAdsConversions.trackSignup(email);
      
      toast({
        title: "Account created successfully!",
        description: `You now have ${planDetails.duration} to chat with mechanics.`,
      });
      
      if (onPaymentSuccess && data) {
        onPaymentSuccess({
          id: data.user.id,
          name: data.user.username,
          email: data.user.email,
          sessionId: data.sessionId
        });
      }
      
      // Reset modal
      resetModal();
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Account creation error:', error);
      
      // Parse backend error from format "400: {error message}"
      const errorMessage = error?.message || '';
      let title = "Account creation error";
      let description = "Please try again later";
      
      // Extract actual error message after status code
      const backendError = errorMessage.includes(': ') ? errorMessage.split(': ').slice(1).join(': ') : errorMessage;
      
      try {
        // Try to parse JSON error response
        const errorData = JSON.parse(backendError);
        if (errorData.error === 'Invalid referral code') {
          title = "Invalid Referral Code";
          description = "The referral code you entered is not valid. Please check and try again, or leave it empty.";
        } else if (errorData.error === 'User already exists') {
          title = "Account Already Exists";
          description = "An account with this email already exists. Please try logging in instead.";
        } else if (errorData.error) {
          description = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, check plain text
        if (backendError.includes('Invalid referral code')) {
          title = "Invalid Referral Code";
          description = "The referral code you entered is not valid. Please check and try again, or leave it empty.";
        } else if (backendError.includes('User already exists')) {
          title = "Account Already Exists";
          description = "An account with this email already exists. Please try logging in instead.";
        } else if (backendError) {
          description = backendError;
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Renew subscription mutation for existing users
  const renewSubscriptionMutation = useMutation({
    mutationFn: async (paymentData: { paymentId: string; paymentMethod: string }) => {
      try {
        // Verify payment and renew subscription for existing user
        const verifyPayload = paymentData.paymentMethod === "stripe" 
          ? { paymentIntentId: paymentData.paymentId, paymentMethod: "stripe", amount: currentPrice }
          : { paypalOrderId: paymentData.paymentId, paymentMethod: "paypal", amount: currentPrice };
          
        const subscriptionResponse = await apiRequest("POST", "/api/verify-payment-and-subscribe", verifyPayload);
        await subscriptionResponse.json();
        
        // Create or get existing chat session
        const sessionResponse = await apiRequest("POST", "/api/chat/sessions", {
          vehicleInfo: vehicleInfo || {}
        });
        const session = await sessionResponse.json();
        
        return { user: user, sessionId: session.id };
      } catch (error) {
        console.error('Renewal mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const planDetails = getPlanDetails(currentSelectedPlan);
      const price = getPlanPrice(currentSelectedPlan, !!referralCode);
      
      // Track successful renewal conversion in Google Ads
      GoogleAdsConversions.trackPurchase({
        transactionId: paymentId || data.sessionId,
        value: price,
        currency: 'USD',
        items: [{
          item_id: currentSelectedPlan,
          item_name: `${planDetails.name} - Renewal`,
          category: 'Automotive Services',
          quantity: 1,
          price: price
        }]
      });
      
      toast({
        title: "Subscription Renewed! 🎉",
        description: `Your ${planDetails.name} has been activated. You now have ${planDetails.duration} of premium access.`,
        duration: 5000,
      });
      
      onPaymentSuccess?.({
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        sessionId: data.sessionId
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Renewal error:", error);
      
      let title = "Renewal Failed";
      let description = "There was an error renewing your subscription. Please try again.";
      
      const backendError = error.message || '';
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Fetch Stripe client secret when card payment is selected and email is provided
  useEffect(() => {
    // Only create payment intent if we don't already have one
    if (paymentMethod === "card" && email && step === "payment" && open && !clientSecret) {
      console.log("Creating payment intent for amount:", currentPrice);
      console.log("Amount type:", typeof currentPrice);
      console.log("JSON payload:", JSON.stringify({ amount: currentPrice }));
      
      apiRequest("POST", "/api/create-payment-intent", { amount: currentPrice })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Payment intent created successfully");
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Failed to create payment intent:", error);
          console.error("Error details:", error.message);
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [paymentMethod, email, step, open]); // Removed currentPrice to prevent recreating

  const handleStripeSuccess = (paymentIntentId: string) => {
    console.log("🎉 handleStripeSuccess called with payment intent ID:", paymentIntentId);
    setPaymentId(paymentIntentId);
    
    // Track add payment info
    const price = getPlanPrice(currentSelectedPlan, !!referralCode);
    GoogleAdsConversions.trackAddPaymentInfo(price);
    
    if (isLoggedIn) {
      // User is already logged in - renew subscription directly
      renewSubscriptionMutation.mutate({
        paymentId: paymentIntentId,
        paymentMethod: "stripe"
      });
    } else {
      // New user - go to account creation
      setStep("account");
    }
  };

  const handlePayPalSuccess = (data: any) => {
    console.log("PayPal payment successful:", data);
    
    // Extract order ID from PayPal response
    const orderId = data?.id || data?.orderID || "";
    setPaymentId(orderId);
    
    // Track add payment info
    const price = getPlanPrice(currentSelectedPlan, !!referralCode);
    GoogleAdsConversions.trackAddPaymentInfo(price);
    
    if (isLoggedIn) {
      // User is already logged in - renew subscription directly
      toast({
        title: "Payment successful!",
        description: "Renewing your subscription...",
      });
      
      renewSubscriptionMutation.mutate({
        paymentId: orderId,
        paymentMethod: "paypal"
      });
    } else {
      // New user - go to account creation
      toast({
        title: "Payment successful!",
        description: "Now create your account",
      });
      
      setStep("account");
    }
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal payment error:", error);
    
    toast({
      title: "Payment failed",
      description: "Please try again or use a different payment method",
      variant: "destructive",
    });
  };

  const handleAccountSetup = () => {
    // Check if username is provided
    if (!username) {
      toast({
        title: "Username missing",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    // Check username length
    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (username.length > 20) {
      toast({
        title: "Username too long",
        description: "Username must be no more than 20 characters long",
        variant: "destructive",
      });
      return;
    }

    // Check username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast({
        title: "Invalid username format",
        description: "Username can only contain letters, numbers, underscores, and hyphens",
        variant: "destructive",
      });
      return;
    }

    // Check if password is provided
    if (!password) {
      toast({
        title: "Password missing",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    // Check password length
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Check if confirm password is provided
    if (!confirmPassword) {
      toast({
        title: "Confirm password missing",
        description: "Please confirm your password",
        variant: "destructive",
      });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Password and confirm password must be identical",
        variant: "destructive",
      });
      return;
    }

    if (!paymentId) {
      toast({
        title: "Payment error",
        description: "Payment ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    createAccountMutation.mutate({
      username,
      email,
      password,
      paymentId,
      paymentMethod,
      referralCode: userInputReferralCode || undefined
    });
  };

  const resetModal = () => {
    setStep("payment");
    setPaymentMethod("card");
    setClientSecret("");
    setEmail(isLoggedIn ? user.email || "" : "");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setUserInputReferralCode(referralCode || "");
    setPaymentId("");
    // Don't reset currentSelectedPlan - keep user's choice throughout the process
    // Only reset plan when modal opens for the first time or payment succeeds
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetModal();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-warning flex items-center justify-center">
              {step === "payment" ? (
                <CreditCard className="w-4 h-4 text-primary-foreground" />
              ) : (
                <User className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <span>
              {step === "payment" 
                ? (isLoggedIn ? "Renew Your Subscription" : "Upgrade to Expert Chat")
                : "Create your account"
              }
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "payment" 
              ? (isLoggedIn 
                  ? `Welcome back ${user?.username}! Choose your plan to renew your subscription and get instant access to professional mechanics.`
                  : `Get access to professional mechanics for $${currentPrice}`
                )
              : "Last step - create login and password for your account"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Referral Discount Banner */}
          {hasReferralDiscount && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">10% Referral Discount Applied!</div>
                  <div className="text-sm text-green-700 dark:text-green-300">You're saving money with referral code: {referralCode}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Plan Selection - show only in payment step */}
          {step === "payment" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Choose Your Plan</Label>
              <div className="grid gap-2">
                {/* Basic Plan */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    currentSelectedPlan === 'basic' 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentSelectedPlan('basic')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">Basic Plan</h4>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">1 Day</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Quick help & basic support</p>
                      </div>
                      <div className="text-right">
                        {hasReferralDiscount ? (
                          <div className="flex flex-col items-end">
                            <div className="text-xs line-through text-gray-500">$14.99</div>
                            <div className="text-base font-bold text-green-600">$13.49</div>
                            <div className="text-xs text-green-600">10% OFF!</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-base font-bold">$14.99</div>
                            <div className="text-xs text-muted-foreground">one-time</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Professional Plan */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    currentSelectedPlan === 'professional' 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentSelectedPlan('professional')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">Professional Plan</h4>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-1.5 py-0.5">30 Days</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Priority support & advanced features</p>
                      </div>
                      <div className="text-right">
                        {hasReferralDiscount ? (
                          <div className="flex flex-col items-end">
                            <div className="text-xs line-through text-gray-500">$49.99</div>
                            <div className="text-base font-bold text-green-600">$44.99</div>
                            <div className="text-xs text-green-600">10% OFF!</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-base font-bold">$49.99</div>
                            <div className="text-xs text-muted-foreground">monthly</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Expert Plan */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    currentSelectedPlan === 'expert' 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentSelectedPlan('expert')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">Expert Plan</h4>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1.5 py-0.5">360 Days</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Full access & dedicated experts</p>
                      </div>
                      <div className="text-right">
                        {hasReferralDiscount ? (
                          <div className="flex flex-col items-end">
                            <div className="text-xs line-through text-gray-500">$79.99</div>
                            <div className="text-base font-bold text-green-600">$71.99</div>
                            <div className="text-xs text-green-600">10% OFF!</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-base font-bold">$79.99</div>
                            <div className="text-xs text-muted-foreground">yearly</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Benefits - show only in payment step */}
          {step === "payment" && (
            <Card className="bg-gradient-to-r from-primary/10 to-warning/10 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasReferralDiscount ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-lg line-through text-gray-500">${originalPrice}</span>
                            <span className="text-2xl font-bold text-green-600">${currentPrice}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                            10% OFF with referral!
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold">${currentPrice}</span>
                      )}
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30">
                      <Star className="w-3 h-3 mr-1" />
                      {planDetails.duration}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <h4 className="font-semibold text-primary">{planDetails.name}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{planDetails.features[0]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{planDetails.features[1] || 'Advanced features'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{planDetails.features[2] || '24/7 availability'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{planDetails.features[3] || 'All vehicle types'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Payment Method Selector */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className="flex items-center justify-center space-x-2"
                    onClick={() => setPaymentMethod("card")}
                    data-testid="button-select-card"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "paypal" ? "default" : "outline"}
                    className="flex items-center justify-center space-x-2"
                    onClick={() => setPaymentMethod("paypal")}
                    data-testid="button-select-paypal"
                  >
                    <SiPaypal className="w-4 h-4" />
                    <span>PayPal</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              
              {/* Stripe Credit Card Form */}
              {paymentMethod === "card" && email && !stripeInstance && (
                <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">
                    Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your environment.
                  </p>
                </div>
              )}

              {paymentMethod === "card" && email && stripeInstance && clientSecret && (
                <Elements stripe={stripeInstance} options={{ clientSecret }}>
                  <StripeCheckoutForm onSuccess={handleStripeSuccess} email={email} currentPrice={currentPrice} />
                </Elements>
              )}

              {paymentMethod === "card" && email && stripeInstance && !clientSecret && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                </div>
              )}

              {paymentMethod === "card" && !email && (
                <p className="text-sm text-muted-foreground">Please enter your email address first</p>
              )}

              {/* PayPal Form */}
              {paymentMethod === "paypal" && email && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-3">
                      Click the PayPal button below to complete your payment securely through PayPal.
                    </p>
                    <PayPalButton
                      amount={currentPrice.toString()}
                      currency="USD"
                      intent="CAPTURE"
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && !email && (
                <p className="text-sm text-muted-foreground">Please enter your email address first</p>
              )}
            </div>
          )}

          {/* Account Setup Form */}
          {step === "account" && (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment completed successfully!</span>
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-username"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>

              <div>
                <Label htmlFor="referralCode">Referral Code (optional)</Label>
                <Input
                  id="referralCode"
                  placeholder="REF123ABC (if someone referred you)"
                  value={userInputReferralCode}
                  onChange={(e) => setUserInputReferralCode(e.target.value.toUpperCase())}
                  data-testid="input-referral-code"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Enter a referral code to help a friend earn rewards
                </div>
              </div>

              <Button 
                onClick={handleAccountSetup}
                disabled={createAccountMutation.isPending}
                className="w-full"
                data-testid="button-create-account"
              >
                {createAccountMutation.isPending ? "Creating account..." : "Create account and start"}
              </Button>
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}