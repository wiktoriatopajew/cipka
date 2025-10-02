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
import { Car, Bus, Wrench, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function Buses() {
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
        <title>Professional Bus & Commercial Vehicle Repair Advice - ChatWithMechanic.com</title>
        <meta name="description" content="Expert bus and commercial vehicle repair advice from certified mechanics. Get instant help with fleet maintenance, engine diagnostics, and commercial transport issues. Plans from $14.99." />
        <meta name="keywords" content="bus repair advice, commercial vehicle help, fleet maintenance, bus mechanic chat, transit vehicle repair, school bus maintenance, coach repair" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Professional Bus & Commercial Vehicle Repair Advice - ChatWithMechanic.com" />
        <meta property="og:description" content="Expert bus and commercial vehicle repair advice from certified mechanics. Fleet maintenance and commercial transport solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/vehicles/buses" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Bus & Commercial Vehicle Repair Advice" />
        <meta name="twitter:description" content="Expert bus and commercial vehicle repair advice from certified mechanics. Fleet maintenance solutions available." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={() => {}} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Bus className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expert Bus & Commercial Vehicle Repair Advice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant professional consultation for buses and commercial vehicles from certified mechanics 
              who understand fleet operations, safety requirements, and heavy-duty maintenance.
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
              Specialized Commercial Vehicle Support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Heavy-Duty Diagnostics</h3>
                  <p className="text-muted-foreground">
                    Expert diagnosis of heavy-duty engines, transmission systems, and commercial vehicle-specific problems.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Fleet Maintenance</h3>
                  <p className="text-muted-foreground">
                    Comprehensive maintenance planning, safety inspections, and preventive care for commercial fleets.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Emergency Support</h3>
                  <p className="text-muted-foreground">
                    24/7 emergency support for commercial vehicle breakdowns and urgent safety concerns.
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
              Common Bus & Commercial Vehicle Issues
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Engine & Drivetrain</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Diesel engine performance issues</li>
                  <li>• Transmission and clutch problems</li>
                  <li>• Cooling system maintenance</li>
                  <li>• Fuel system diagnostics</li>
                  <li>• Turbocharger issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Safety & Systems</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Air brake system maintenance</li>
                  <li>• Electrical system diagnosis</li>
                  <li>• Suspension and steering</li>
                  <li>• HVAC system problems</li>
                  <li>• Safety inspection guidance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get Professional Commercial Vehicle Advice
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Keep your buses and commercial vehicles running safely and efficiently with expert guidance 
              from mechanics who understand commercial transport requirements.
            </p>
            <Link href="/" data-testid="button-start-consultation">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Fleet Consultation - From $14.99
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}