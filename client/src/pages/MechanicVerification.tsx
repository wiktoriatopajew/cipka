import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Shield, Award, CheckCircle, Users, GraduationCap, FileCheck } from "lucide-react";

export default function MechanicVerification() {
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
        <title>Mechanic Verification & Certification Process | ChatWithMechanic.com</title>
        <meta name="description" content="Learn about our rigorous mechanic verification process. All ChatWithMechanic.com mechanics are ASE certified professionals with verified credentials, experience, and ongoing training requirements." />
        <meta name="keywords" content="mechanic verification, ASE certification, automotive technician credentials, certified mechanics, professional verification, mechanic qualifications, automotive expertise" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Mechanic Verification & Certification Process" />
        <meta property="og:description" content="Rigorous verification ensures all our mechanics are ASE certified professionals with verified credentials and automotive expertise." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/mechanic-verification" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mechanic Verification & Certification Process" />
        <meta name="twitter:description" content="Learn about our rigorous process for verifying and certifying automotive professionals." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={() => {}} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Mechanic Verification & Certification
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Trust is earned through rigorous verification. Every mechanic on our platform undergoes 
              comprehensive credential verification, skills assessment, and ongoing professional development.
            </p>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              Our Rigorous Verification Process
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold mb-6">5-Step Verification System</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold mb-2">Credential Verification</h4>
                      <p className="text-muted-foreground">ASE certifications, state licenses, and professional credentials verified directly with issuing authorities.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold mb-2">Experience Assessment</h4>
                      <p className="text-muted-foreground">Minimum 5 years professional automotive experience with detailed work history verification.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold mb-2">Skills Testing</h4>
                      <p className="text-muted-foreground">Comprehensive technical knowledge assessment covering diagnostics, repair procedures, and safety protocols.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-semibold mb-2">Background Check</h4>
                      <p className="text-muted-foreground">Professional background verification and reference checks from previous employers or customers.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                    <div>
                      <h4 className="font-semibold mb-2">Communication Assessment</h4>
                      <p className="text-muted-foreground">Evaluation of communication skills, customer service approach, and ability to explain technical concepts clearly.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <Award className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">ASE Certification Required</h3>
                    <p className="text-muted-foreground">
                      All mechanics must hold current ASE (Automotive Service Excellence) certifications or equivalent professional credentials.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <GraduationCap className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">Continuous Education</h3>
                    <p className="text-muted-foreground">
                      Ongoing training requirements ensure our mechanics stay current with latest automotive technologies and repair techniques.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Required Certifications & Specializations
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Automotive Service Excellence (ASE)</h3>
                  <p className="text-muted-foreground">
                    Industry-standard certification covering engine repair, brakes, electrical systems, and more.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Marine Technician Certification</h3>
                  <p className="text-muted-foreground">
                    Specialized certification for marine engines, boat systems, and watercraft maintenance.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Heavy Equipment Certification</h3>
                  <p className="text-muted-foreground">
                    Professional certification for construction equipment, hydraulics, and heavy machinery.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Motorcycle Specialist Certification</h3>
                  <p className="text-muted-foreground">
                    Specialized training in motorcycle engines, systems, and two-wheeler maintenance.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Commercial Vehicle Certification</h3>
                  <p className="text-muted-foreground">
                    Professional certification for buses, commercial trucks, and fleet vehicle maintenance.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Diagnostic Technology Training</h3>
                  <p className="text-muted-foreground">
                    Advanced training in modern diagnostic equipment and electronic vehicle systems.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quality Assurance */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Ongoing Quality Assurance
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Customer Feedback</h3>
                  <p className="text-muted-foreground">
                    Regular monitoring of customer satisfaction and feedback to ensure service quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <FileCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Performance Reviews</h3>
                  <p className="text-muted-foreground">
                    Quarterly performance evaluations based on accuracy, response time, and customer satisfaction.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Training Updates</h3>
                  <p className="text-muted-foreground">
                    Mandatory training on new vehicle technologies, safety protocols, and diagnostic techniques.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Certification Renewal</h3>
                  <p className="text-muted-foreground">
                    Annual verification of certification renewals and continuing education requirements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Questions About Our Verification Process?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions about our mechanic verification standards or want to learn more about our quality assurance process? 
              Contact our team for detailed information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" data-testid="link-contact-verification">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Contact Us
                </Button>
              </Link>
              <a 
                href="mailto:support@chatwithmechanic.com" 
                data-testid="link-email-verification"
              >
                <Button size="lg" className="text-lg px-8 py-3">
                  Email: support@chatwithmechanic.com
                </Button>
              </a>
            </div>
          </div>
        </section>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}