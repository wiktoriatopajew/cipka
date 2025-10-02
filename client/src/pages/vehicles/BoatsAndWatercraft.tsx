import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Car, Ship, Wrench, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function BoatsAndWatercraft() {
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

  return (
    <>
      <Helmet>
        <title>Professional Boat & Marine Engine Repair Advice - ChatWithMechanic.com</title>
        <meta name="description" content="Expert marine engine and boat repair advice from certified marine mechanics. Get instant help with boat problems, engine diagnostics, and watercraft maintenance. Plans from $14.99." />
        <meta name="keywords" content="boat repair advice, marine engine help, watercraft maintenance, boat mechanic chat, marine diagnostics, boat engine problems, yacht repair" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Professional Boat & Marine Engine Repair Advice - ChatWithMechanic.com" />
        <meta property="og:description" content="Expert marine engine and boat repair advice from certified marine mechanics. Get instant help with boat problems and maintenance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/vehicles/boats-watercraft" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Boat & Marine Engine Repair Advice" />
        <meta name="twitter:description" content="Expert marine engine and boat repair advice from certified marine mechanics. Instant watercraft consultation available." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={() => {}} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Ship className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expert Marine Engine & Boat Repair Advice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant professional marine consultation from certified mechanics who understand boats and watercraft. 
              From engine diagnostics to hull maintenance, we keep you on the water.
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
              Comprehensive Marine Support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Marine Engine Diagnostics</h3>
                  <p className="text-muted-foreground">
                    Expert diagnosis of inboard, outboard, and sterndrive engines. Troubleshoot performance issues and mechanical problems.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Maintenance Guidance</h3>
                  <p className="text-muted-foreground">
                    Learn proper marine maintenance, winterization, corrosion prevention, and seasonal preparation for your watercraft.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Emergency Marine Support</h3>
                  <p className="text-muted-foreground">
                    24/7 support for marine emergencies, engine failures, and safety concerns when you're out on the water.
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
              Common Marine Issues We Help Solve
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Engine & Performance</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Engine starting problems</li>
                  <li>• Overheating and cooling issues</li>
                  <li>• Fuel system problems</li>
                  <li>• Propeller and drive issues</li>
                  <li>• Power loss and performance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Systems & Maintenance</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Electrical system diagnosis</li>
                  <li>• Hull and structural issues</li>
                  <li>• Steering and control problems</li>
                  <li>• Corrosion and salt damage</li>
                  <li>• Winterization and storage</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get Professional Marine Advice Now
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Don't let marine engine problems ruin your time on the water. Connect with certified marine mechanics 
              who understand the unique challenges of watercraft maintenance.
            </p>
            <Link href="/" data-testid="button-start-consultation">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Marine Consultation - From $14.99
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}