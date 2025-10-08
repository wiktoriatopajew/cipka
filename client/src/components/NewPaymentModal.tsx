import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Clock, CheckCircle, Star, User } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PayPalButton from "@/components/PayPalButton";
import SimpleStripePayment from "@/components/SimpleStripePayment";
import { GoogleAdsConversions, PLAN_PRICES, PlanType } from "@/lib/googleAdsTracking";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (user: { id: string; name: string; email: string; sessionId: string }) => void;
  vehicleInfo?: any;
  selectedPlan?: 'basic' | 'professional' | 'expert';
  referralCode?: string;
  user?: any;
}

// Helper functions for pricing
function getPlanPrice(plan: 'basic' | 'professional' | 'expert', hasDiscount: boolean): number {
  const prices = { basic: 14.99, professional: 49.99, expert: 79.99 };
  const basePrice = prices[plan];
  return hasDiscount ? Math.round((basePrice * 0.8) * 100) / 100 : basePrice;
}

function getPlanDetails(plan: 'basic' | 'professional' | 'expert') {
  const details = {
    basic: { name: 'Basic Plan', duration: '1 day', features: ['1 day access', 'Chat with mechanics', 'All vehicle types', 'Basic support'] },
    professional: { name: 'Professional Plan', duration: '30 days', features: ['30 days access', 'Priority support', 'Advanced diagnostics', 'All vehicle types'] },
    expert: { name: 'Expert Plan', duration: '360 days', features: ['360 days access', 'Expert consultations', 'Priority support', 'All vehicle types'] }
  };
  return details[plan];
}

export default function PaymentModal({ open, onOpenChange, onPaymentSuccess, vehicleInfo, selectedPlan = 'basic', referralCode = '', user }: PaymentModalProps) {
  console.log('PaymentModal received vehicleInfo:', vehicleInfo);
  console.log('PaymentModal received user:', user);
  
  const isLoggedIn = user && user.id;
  const [step, setStep] = useState("payment");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [email, setEmail] = useState(isLoggedIn ? user.email || "" : "");
  const [paymentId, setPaymentId] = useState<string>("");
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState<'basic' | 'professional' | 'expert'>(selectedPlan);
  
  // Account setup fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userInputReferralCode, setUserInputReferralCode] = useState("");
  
  const { toast } = useToast();

  // Calculate pricing
  const hasReferralDiscount = !!(referralCode && referralCode.trim() !== '');
  const currentPrice = getPlanPrice(currentSelectedPlan, hasReferralDiscount);
  const originalPrice = getPlanPrice(currentSelectedPlan, false);
  const planDetails = getPlanDetails(currentSelectedPlan);

  // Set initial referral code from prop
  useEffect(() => {
    if (referralCode) {
      setUserInputReferralCode(referralCode);
    }
  }, [referralCode]);
  
  // Set initial selected plan when modal opens
  useEffect(() => {
    if (open && selectedPlan && step === "payment") {
      setCurrentSelectedPlan(selectedPlan);
      
      // Track begin_checkout when modal opens
      const price = getPlanPrice(selectedPlan, !!referralCode);
      GoogleAdsConversions.trackBeginCheckout(price);
    }
  }, [open]);

  // Create user and subscription mutation
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
        
        // Verify payment and create subscription
        const verifyPayload = accountData.paymentMethod === "stripe" 
          ? { paymentIntentId: accountData.paymentId, paymentMethod: "stripe", amount: currentPrice }
          : { paypalOrderId: accountData.paymentId, paymentMethod: "paypal", amount: currentPrice };
          
        const subscriptionResponse = await apiRequest("POST", "/api/verify-payment-and-subscribe", verifyPayload);
        await subscriptionResponse.json();
        
        // Create chat session
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
      
      // Track successful conversion
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
      
      resetModal();
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Account creation error:', error);
      toast({
        title: "Account creation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Renew subscription mutation for existing users
  const renewSubscriptionMutation = useMutation({
    mutationFn: async (paymentData: { paymentId: string; paymentMethod: string }) => {
      try {
        const verifyPayload = paymentData.paymentMethod === "stripe" 
          ? { paymentIntentId: paymentData.paymentId, paymentMethod: "stripe", amount: currentPrice }
          : { paypalOrderId: paymentData.paymentId, paymentMethod: "paypal", amount: currentPrice };
          
        const subscriptionResponse = await apiRequest("POST", "/api/verify-payment-and-subscribe", verifyPayload);
        await subscriptionResponse.json();
        
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
        description: `Your ${planDetails.name} has been activated.`,
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
      toast({
        title: "Renewal Failed",
        description: "There was an error renewing your subscription.",
        variant: "destructive",
      });
    },
  });

  const handleStripeSuccess = (paymentIntentId: string) => {
    console.log("🎉 Stripe payment successful:", paymentIntentId);
    setPaymentId(paymentIntentId);
    
    const price = getPlanPrice(currentSelectedPlan, !!referralCode);
    GoogleAdsConversions.trackAddPaymentInfo(price);
    
    if (isLoggedIn) {
      renewSubscriptionMutation.mutate({
        paymentId: paymentIntentId,
        paymentMethod: "stripe"
      });
    } else {
      setStep("account");
    }
  };

  const handleStripeError = (error: string) => {
    console.error("Stripe payment error:", error);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handlePayPalSuccess = (data: any) => {
    console.log("PayPal payment successful:", data);
    const orderId = data?.id || data?.orderID || "";
    setPaymentId(orderId);
    
    const price = getPlanPrice(currentSelectedPlan, !!referralCode);
    GoogleAdsConversions.trackAddPaymentInfo(price);
    
    if (isLoggedIn) {
      toast({
        title: "Payment successful!",
        description: "Renewing your subscription...",
      });
      
      renewSubscriptionMutation.mutate({
        paymentId: orderId,
        paymentMethod: "paypal"
      });
    } else {
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
    if (!username) {
      toast({
        title: "Username missing",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    createAccountMutation.mutate({
      username,
      email,
      password,
      paymentId,
      paymentMethod: paymentMethod === "card" ? "stripe" : "paypal",
      referralCode: userInputReferralCode
    });
  };

  const resetModal = () => {
    setStep("payment");
    setPaymentMethod("card");
    setEmail(isLoggedIn ? user.email || "" : "");
    setPaymentId("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setUserInputReferralCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>
              {step === "payment" ? "Choose Your Plan" : "Create Your Account"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Selection and Pricing */}
          {step === "payment" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{planDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{planDetails.duration} access</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {hasReferralDiscount && (
                        <Badge variant="secondary" className="text-xs">
                          20% OFF
                        </Badge>
                      )}
                      <div className="text-2xl font-bold">${currentPrice}</div>
                    </div>
                    {hasReferralDiscount && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${originalPrice}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {planDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
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
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "paypal" ? "default" : "outline"}
                    className="flex items-center justify-center space-x-2"
                    onClick={() => setPaymentMethod("paypal")}
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
                />
              </div>
              
              {/* Stripe Payment */}
              {paymentMethod === "card" && email && (
                <SimpleStripePayment
                  amount={currentPrice}
                  email={email}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              )}

              {paymentMethod === "card" && !email && (
                <p className="text-sm text-muted-foreground">Please enter your email address first</p>
              )}

              {/* PayPal Payment */}
              {paymentMethod === "paypal" && email && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-3">
                      Click the PayPal button below to complete your payment securely.
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
                />
              </div>

              <div>
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  value={userInputReferralCode}
                  onChange={(e) => setUserInputReferralCode(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAccountSetup} 
                className="w-full"
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending ? "Creating Account..." : "Complete Setup"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}