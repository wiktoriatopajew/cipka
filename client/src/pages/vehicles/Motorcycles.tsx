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
import { Car, Bike, Wrench, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function Motorcycles() {
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
        <title>Professional Motorcycle Repair Advice & Diagnostics - ChatWithMechanic.com</title>
        <meta name="description" content="Expert motorcycle repair advice from certified mechanics. Get instant help with bike problems, maintenance, and performance issues. Plans from $14.99 for motorcycle consultation chat access." />
        <meta name="keywords" content="motorcycle repair advice, bike mechanic chat, motorcycle diagnostics, bike maintenance, motorcycle problems, two-wheeler repair help" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Professional Motorcycle Repair Advice & Diagnostics - ChatWithMechanic.com" />
        <meta property="og:description" content="Expert motorcycle repair advice from certified mechanics. Get instant help with bike problems, maintenance, and performance issues." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/vehicles/motorcycles" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Motorcycle Repair Advice & Diagnostics" />
        <meta name="twitter:description" content="Expert motorcycle repair advice from certified mechanics. Get instant help with bike problems and maintenance." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={() => {}} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Bike className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expert Motorcycle Repair Advice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant professional motorcycle consultation from certified mechanics who understand bikes. 
              From engine diagnostics to electrical issues, we've got your ride covered.
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
              Specialized Motorcycle Support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Engine & Performance</h3>
                  <p className="text-muted-foreground">
                    Expert diagnosis of motorcycle engine issues, carburetor problems, fuel injection, and performance optimization.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Maintenance & Care</h3>
                  <p className="text-muted-foreground">
                    Learn proper motorcycle maintenance, chain care, tire pressure, oil changes, and seasonal preparation.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Emergency Roadside Help</h3>
                  <p className="text-muted-foreground">
                    24/7 support for motorcycle breakdowns, safety concerns, and urgent repair guidance when you're on the road.
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
              Common Motorcycle Issues We Diagnose
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Engine & Drivetrain</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Starting and ignition problems</li>
                  <li>• Carburetor and fuel injection issues</li>
                  <li>• Engine misfiring or rough idle</li>
                  <li>• Clutch and transmission problems</li>
                  <li>• Chain and sprocket wear</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Electrical & Systems</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Electrical system diagnosis</li>
                  <li>• Brake system maintenance</li>
                  <li>• Suspension and handling issues</li>
                  <li>• Cooling system problems</li>
                  <li>• Lighting and indicator faults</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get Expert Motorcycle Advice Now
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Keep your motorcycle running smoothly with professional guidance from mechanics 
              who specialize in two-wheelers and understand every aspect of bike maintenance.
            </p>
            <Link href="/" data-testid="button-start-consultation">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Motorcycle Consultation - From $14.99
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}