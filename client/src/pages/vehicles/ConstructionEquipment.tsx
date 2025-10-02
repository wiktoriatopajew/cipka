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
import { Car, Construction, Wrench, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function ConstructionEquipment() {
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
        <title>Professional Construction Equipment Repair Advice - ChatWithMechanic.com</title>
        <meta name="description" content="Expert construction equipment and heavy machinery repair advice from certified mechanics. Get instant help with excavators, bulldozers, cranes, and construction vehicle maintenance. Plans from $14.99." />
        <meta name="keywords" content="construction equipment repair, heavy machinery advice, excavator problems, bulldozer maintenance, crane repair, construction vehicle help, heavy equipment mechanic" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Professional Construction Equipment Repair Advice - ChatWithMechanic.com" />
        <meta property="og:description" content="Expert construction equipment and heavy machinery repair advice from certified mechanics. Heavy equipment maintenance solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/vehicles/construction-equipment" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Construction Equipment Repair Advice" />
        <meta name="twitter:description" content="Expert construction equipment and heavy machinery repair advice from certified mechanics." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={() => {}} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Construction className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expert Construction Equipment Repair Advice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant professional consultation for construction equipment and heavy machinery from certified mechanics 
              who understand hydraulics, heavy-duty engines, and industrial equipment maintenance.
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
              Specialized Heavy Equipment Support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Hydraulic Systems</h3>
                  <p className="text-muted-foreground">
                    Expert diagnosis of hydraulic pumps, cylinders, valves, and fluid systems for construction machinery.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Preventive Maintenance</h3>
                  <p className="text-muted-foreground">
                    Comprehensive maintenance schedules, fluid analysis, and preventive care for heavy equipment longevity.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Field Support</h3>
                  <p className="text-muted-foreground">
                    24/7 emergency support for equipment breakdowns and urgent repair guidance in the field.
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
              Common Construction Equipment Issues
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-4">Hydraulic & Engine</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Hydraulic pump failures</li>
                  <li>• Engine overheating issues</li>
                  <li>• Hydraulic fluid leaks</li>
                  <li>• Turbocharger problems</li>
                  <li>• Cooling system maintenance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Systems & Components</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Track and undercarriage wear</li>
                  <li>• Electrical system diagnosis</li>
                  <li>• Transmission and drivetrain</li>
                  <li>• Attachment and implement issues</li>
                  <li>• Control system problems</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get Professional Heavy Equipment Advice
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Maximize uptime and reduce maintenance costs with expert guidance from mechanics 
              who specialize in construction equipment and heavy machinery.
            </p>
            <Link href="/" data-testid="button-start-consultation">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Equipment Consultation - From $14.99
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}