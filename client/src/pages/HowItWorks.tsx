import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Car, ClipboardList, CreditCard, MessageCircle, CheckCircle, Upload, Clock, Home } from "lucide-react";

export default function HowItWorks() {
  const [showLogin, setShowLogin] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/users/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
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

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    toast({
      title: "Welcome!",
      description: "You're now logged in and can access our services.",
    });
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>How It Works - Professional Automotive Consultation Process | ChatWithMechanic.com</title>
        <meta name="description" content="Learn how ChatWithMechanic.com works. Simple 3-step process: choose your plan (from $14.99), fill vehicle info & pay, chat with certified mechanics. Get instant automotive advice with file upload support in minutes." />
        <meta name="keywords" content="how it works, automotive consultation process, mechanic chat steps, vehicle repair help, online automotive advice, car problem diagnosis" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="How It Works - Professional Automotive Consultation Process" />
        <meta property="og:description" content="Simple 3-step process to get professional automotive advice. Choose your plan (from $14.99), fill vehicle info & pay, chat with certified mechanics instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/how-it-works" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works - Automotive Consultation Process" />
        <meta name="twitter:description" content="Learn how to get instant professional automotive advice through our simple 3-step process." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={handleLogin} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <ClipboardList className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get professional automotive advice in just three simple steps. 
              Connect with certified mechanics instantly and solve your vehicle problems quickly.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              Simple 3-Step Process
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <Card className="hover-elevate relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">Choose Your Plan</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Select from our flexible pricing plans starting at $14.99. Basic Plan ($14.99) gives you 1 day access, Professional Plan ($49.99) provides 30 days of unlimited priority access, and Expert Plan ($79.99) offers unlimited premium features with dedicated support.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="hover-elevate relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">Fill Vehicle Info & Pay</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Tell us about your vehicle - make, model, year, engine type, and describe the issue you're experiencing. 
                    Complete secure payment processing with industry-standard encryption for your protection.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="hover-elevate relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">Chat with Experts</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Instantly connect with certified mechanics who specialize in your vehicle type. 
                    Get professional advice, diagnostic help, and repair guidance in real-time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              What You Get
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">File Upload Support</h3>
                  <p className="text-muted-foreground">
                    Upload photos and videos of your vehicle issues to help mechanics provide more accurate diagnostics.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">24/7 Availability</h3>
                  <p className="text-muted-foreground">
                    Access certified mechanics any time of day or night, including weekends and holidays.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Unlimited Consultations</h3>
                  <p className="text-muted-foreground">
                    Ask as many questions as needed during your subscription period. No limits on chat sessions or follow-up questions.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Real-Time Chat</h3>
                  <p className="text-muted-foreground">
                    Instant messaging with certified mechanics - no waiting for email responses or scheduled calls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Vehicle Types */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              All Vehicle Types Supported
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 text-center">
              <Link href="/vehicles/cars-trucks" className="hover:text-primary" data-testid="link-cars-trucks">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">Cars & Trucks</h3>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vehicles/motorcycles" className="hover:text-primary" data-testid="link-motorcycles">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">Motorcycles</h3>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vehicles/boats-watercraft" className="hover:text-primary" data-testid="link-boats">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">Boats & Watercraft</h3>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vehicles/buses" className="hover:text-primary" data-testid="link-buses">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">Buses</h3>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vehicles/rv-campers" className="hover:text-primary" data-testid="link-rv-campers">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Home className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">RV & Campers</h3>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vehicles/construction-equipment" className="hover:text-primary" data-testid="link-construction">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">Construction Equipment</h3>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of vehicle owners who trust ChatWithMechanic for reliable automotive advice. 
              Get started now and solve your vehicle problems today.
            </p>
            <Link href="/" data-testid="button-start-now">
              <Button size="lg" className="text-lg px-8 py-3">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Your Consultation - From $14.99
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
        
        <LoginModal 
          open={showLogin}
          onOpenChange={setShowLogin}
          onLoginSuccess={handleLoginSuccess}
        />
        <ScrollToTop />
      </div>
    </>
  );
}