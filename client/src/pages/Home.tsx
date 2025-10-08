import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useMechanicsCount } from "@/hooks/useMechanicsCount";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import LiveChatPreview from "@/components/LiveChatPreview";
import OnlineMechanics from "@/components/OnlineMechanics";
import VehicleSelector from "@/components/VehicleSelector";
import ChatInterface from "@/components/ChatInterface";
import ChatHistory from "@/components/ChatHistory";
import PaymentModal from "@/components/NewPaymentModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import LoginModal from "@/components/LoginModal";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ReferralPanel from "@/components/ReferralPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { GoogleAdsConversions } from "@/lib/googleAdsTracking";

export default function Home() {
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingSelectedSessionId, setPendingSelectedSessionId] = useState<string | null>(null);
  const [pendingVehicleInfo, setPendingVehicleInfo] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'professional' | 'expert'>('basic');
  const [referralCode, setReferralCode] = useState<string>('');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get real number of available mechanics
  const mechanicsCount = useMechanicsCount();

  // Check for referral code in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const paymentParam = urlParams.get('payment');
    
    // Track page view for Google Ads remarketing
    GoogleAdsConversions.trackPageView('/');
    
    if (refCode) {
      setReferralCode(refCode);
    }
    
    // Auto-open PaymentModal if payment=true in URL
    if (paymentParam === 'true') {
      setShowPayment(true);
      // Show welcome message for referral users
      if (refCode) {
        toast({
          title: "🎁 Referral Link Detected!",
          description: "You'll get 30 days free access when you subscribe. Choose your plan below!",
          duration: 6000,
        });
      }
    }
    
    // Clean up URL parameters
    if (refCode || paymentParam) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      newUrl.searchParams.delete('payment');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  // Check if user is authenticated
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
    retry: false, // Don't retry if not authenticated
    refetchOnWindowFocus: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/users/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setShowChat(false);
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      window.location.href = '/';
    },
    onError: () => {
      toast({
        title: "Logout error",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleScrollToVehicleSelector = () => {
    const vehicleSection = document.getElementById('vehicle-selector-section');
    if (vehicleSection) {
      vehicleSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    navigate('/faq');
  };

  const handlePlanSelect = (plan: 'basic' | 'professional' | 'expert') => {
    setSelectedPlan(plan);
    // Scroll to vehicle selector after plan selection
    handleScrollToVehicleSelector();
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    // User is now logged in, they can continue using the app
    // The user query will automatically refresh due to React Query
    toast({
      title: "Welcome!",
      description: "You're now logged in. You can purchase chat access to start consulting with mechanics.",
    });
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if user has active subscription
  const hasAccess = (user as any)?.hasSubscription || false;

  // Update online status with heartbeat
  useOnlineStatus(!!user);

  const handleStartChat = () => {
    if (!hasAccess) {
      setShowConfirmation(true);
    } else {
      setShowChat(true);
    }
  };

  const handleReturnToChat = () => {
    setShowChat(true);
  };

  const handlePaymentSuccess = (userData: { id: string; name: string; email: string; sessionId: string }) => {
    console.log('Payment successful!', userData);
    // Refresh user data to get updated subscription status
    queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    
    // Close payment modal
    setShowPayment(false);
    
    // Check if user was trying to continue a selected session
    if (pendingSelectedSessionId && pendingVehicleInfo) {
      // Continue the previously selected chat session
      setSessionId(pendingSelectedSessionId);
      setVehicleInfo(pendingVehicleInfo);
      
      // Clear pending state
      setPendingSelectedSessionId(null);
      setPendingVehicleInfo(null);
      
      toast({
        title: "Welcome back!",
        description: "Continuing your previous chat session.",
      });
    } else {
      // Start a new session (original behavior)
      setSessionId(userData.sessionId);
      setVehicleInfo(null);
    }
    
    setShowChat(true);
  };

  const handleVehicleSubmit = (info: any) => {
    console.log('Vehicle info submitted:', info);
    setVehicleInfo(info);
    console.log('Vehicle info set to state:', info);
    handleStartChat();
  };

  const handleSelectSession = async (selectedSessionId: string, selectedVehicleInfo: any) => {
    console.log('Selected chat session:', selectedSessionId);
    
    // Check if user has access before showing chat
    if (!hasAccess) {
      // Store the selected session for after payment
      setPendingSelectedSessionId(selectedSessionId);
      setPendingVehicleInfo(selectedVehicleInfo);
      
      toast({
        title: "Premium access required",
        description: "You'll continue this chat after subscribing.",
      });
      
      setShowPayment(true);
    } else {
      // User has access, continue directly
      setSessionId(selectedSessionId);
      setVehicleInfo(selectedVehicleInfo);
      setShowChat(true);
    }
  };

  const handleConfirmationConfirm = () => {
    setShowConfirmation(false);
    setShowPayment(true);
  };

  const handleConfirmationChangePlan = () => {
    setShowConfirmation(false);
    // Scroll to pricing plans section
    const pricingSection = document.getElementById('pricing-plans-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback to top if section not found
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleStartNewChat = () => {
    setSessionId(null);
    setVehicleInfo(null);
    const vehicleSection = document.getElementById('vehicle-selector-section');
    if (vehicleSection) {
      vehicleSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface 
                hasAccess={hasAccess}
                vehicleInfo={vehicleInfo}
                sessionId={sessionId || ''}
                userId={(user as any)?.id || ''}
                username={(user as any)?.username || ''}
                className="h-[600px]"
              />
            </div>
            <div className="space-y-6">
              <OnlineMechanics />
              <Card>
                <CardHeader>
                  <CardTitle>Session Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>Status: {hasAccess ? 'Premium Access' : 'Free Tier'}</div>
                    <div>Response Time: ~2-3 minutes</div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setShowChat(false)}
                    data-testid="button-back-home"
                  >
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <PaymentModal 
          open={showPayment}
          onOpenChange={setShowPayment}
          onPaymentSuccess={handlePaymentSuccess}
          vehicleInfo={vehicleInfo}
          selectedPlan={selectedPlan}
          referralCode={referralCode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user as any} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Subscription Required Banner - at the very top for users without access */}
      {user && !hasAccess && (
        <section className="py-8 bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-950/30 dark:via-red-950/20 dark:to-red-950/30 border-b border-red-200 dark:border-red-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">
                  Subscription Required
                </h2>
              </div>
              <p className="text-red-700 dark:text-red-300 text-lg">
                Hi <span className="font-semibold">{(user as any).username}</span>! To access our expert mechanics and start chatting, you need an active subscription.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {mechanicsCount} mechanics available now
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get instant access to professional automotive advice and troubleshooting support.
                </p>
              </div>
              
              <Button 
                onClick={() => setShowPayment(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Choose Your Plan
              </Button>
            </div>
          </div>
        </section>
      )}
      
      {/* Welcome section for users with subscription */}
      {user && hasAccess && (
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-warning/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Hello, <span className="bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent">{(user as any).username}</span>!
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                You have unlimited access to our expert mechanics. 
                {(user as any)?.subscriptionDaysLeft && (
                  <span className="block mt-2 text-lg">
                    Your subscription expires in <span className="font-semibold text-primary">{(user as any).subscriptionDaysLeft} days</span>
                  </span>
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-success" />
                <span className="text-success font-medium">{mechanicsCount} mechanics online now</span>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-primary-foreground font-semibold px-8 py-3"
                onClick={handleReturnToChat}
              >
                Return to Chat
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Chat History section for logged-in users */}
      {user && (user as any)?.id && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ChatHistory
                  onSelectSession={handleSelectSession}
                  onStartNewChat={handleStartNewChat}
                />
              </div>
              <div className="space-y-6">
                <OnlineMechanics />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Referral Panel for all logged in users */}
      {user && (
        <ReferralPanel onChoosePlan={() => setShowPayment(true)} />
      )}

      {/* HeroSection - only show for non-logged in users */}
      {!user && (
        <HeroSection 
          onStartChat={handleScrollToVehicleSelector}
          onGetStarted={handleLearnMore}
          onPlanSelect={handlePlanSelect}
          user={user as any}
        />
      )}
      
      {/* Stats Section - Trust & Credibility */}
      <StatsSection />
      
      {/* Live Chat Preview - only show for non-logged in users */}
      {!user && <LiveChatPreview />}
      
      {/* Vehicle Selector Section - only show for users without active subscription */}
      {(!user || !hasAccess) && (
        <section id="vehicle-selector-section" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Start Your Consultation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tell us about your vehicle and the issues you're experiencing. Our AI will help you get started, 
                then connect you with the right expert for detailed assistance.
              </p>
            </div>
            
            {user ? (
              <div className="max-w-2xl mx-auto">
                <VehicleSelector onSubmit={handleVehicleSubmit} />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <VehicleSelector onSubmit={handleVehicleSubmit} />
                </div>
                <div>
                  <OnlineMechanics />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      
      <Footer />
      
      <ConfirmationModal 
        open={showConfirmation}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
        onChangePlan={handleConfirmationChangePlan}
        selectedPlan={selectedPlan}
        vehicleInfo={vehicleInfo}
      />
      
      <PaymentModal 
        open={showPayment}
        onOpenChange={setShowPayment}
        onPaymentSuccess={handlePaymentSuccess}
        vehicleInfo={vehicleInfo}
        selectedPlan={selectedPlan}
        referralCode={referralCode}
        user={user}
      />
      
      <LoginModal 
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      <ScrollToTop />
    </div>
  );
}