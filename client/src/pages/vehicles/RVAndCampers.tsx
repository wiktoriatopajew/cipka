import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Home, Truck, Wrench, MessageCircle, Clock, CheckCircle, Zap, Droplets } from "lucide-react";

export default function RVAndCampers() {
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
        <title>Professional RV & Camper Repair Advice - ChatWithMechanic.com</title>
        <meta name="description" content="Get instant expert RV and camper advice from certified mechanics. Plans from $14.99. Professional diagnosis, repair guidance, and maintenance tips for recreational vehicles available 24/7." />
        <meta name="keywords" content="RV repair advice, camper repair help, recreational vehicle consultation, RV mechanic chat, camper diagnostics, RV problems, camper maintenance" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Professional RV & Camper Repair Advice - ChatWithMechanic.com" />
        <meta property="og:description" content="Get instant expert RV and camper advice from certified mechanics. Plans from $14.99." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/vehicles/rv-campers" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional RV & Camper Repair Advice" />
        <meta name="twitter:description" content="Get instant expert RV and camper advice from certified mechanics. Plans from $14.99." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={handleLogin} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center space-x-4 mb-6">
              <Home className="h-16 w-16 text-primary" />
              <Truck className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expert RV & Camper Repair Advice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant professional consultation for your recreational vehicle or camper from certified mechanics. 
              Diagnose problems, get repair guidance, and learn proper maintenance techniques for life on the road.
            </p>
            <Link href="/" data-testid="button-start-chat">
              <Button size="lg" className="text-lg px-8 py-3">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chat from $14.99
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Comprehensive RV & Camper Support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Engine & Chassis Diagnostics</h3>
                  <p className="text-muted-foreground">
                    Professional diagnosis of engine problems, transmission issues, and chassis-related concerns for all types of RVs and campers.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Electrical Systems</h3>
                  <p className="text-muted-foreground">
                    Get help with 12V/110V electrical systems, battery issues, solar panels, inverters, and all RV electrical components.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Droplets className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Plumbing & Water Systems</h3>
                  <p className="text-muted-foreground">
                    Expert guidance on fresh water, grey water, black water systems, pumps, tanks, and plumbing repairs.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Preventive Maintenance</h3>
                  <p className="text-muted-foreground">
                    Learn proper maintenance schedules, winterization, roof care, and preventive measures to keep your RV road-ready.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Appliance Support</h3>
                  <p className="text-muted-foreground">
                    Get help with refrigerators, water heaters, furnaces, air conditioners, and all RV appliances and systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Emergency Roadside Help</h3>
                  <p className="text-muted-foreground">
                    24/7 availability for urgent RV problems. Get immediate guidance for breakdowns and safety concerns while traveling.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Common RV & Camper Issues We Help With
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Mechanical & Structural</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Engine and transmission problems</li>
                  <li>• Brake system issues</li>
                  <li>• Suspension and leveling systems</li>
                  <li>• Slideout mechanisms</li>
                  <li>• Roof and seal maintenance</li>
                  <li>• Awning and exterior components</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Systems & Appliances</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Electrical and battery systems</li>
                  <li>• Plumbing and water system issues</li>
                  <li>• Heating and cooling problems</li>
                  <li>• Refrigerator and appliance repairs</li>
                  <li>• Propane system troubleshooting</li>
                  <li>• Generator maintenance and repair</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get Professional RV & Camper Advice Now
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Don't let RV problems ruin your adventure. Connect with certified mechanics 
              who specialize in recreational vehicles and understand life on the road.
            </p>
            <Link href="/" data-testid="button-start-consultation">
              <Button size="lg" className="text-lg px-8 py-3">
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
      </div>
    </>
  );
}