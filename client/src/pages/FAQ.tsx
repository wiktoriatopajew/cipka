import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { HelpCircle, MessageCircle } from "lucide-react";

export default function FAQ() {
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
        <title>Frequently Asked Questions - ChatWithMechanic.com</title>
        <meta name="description" content="Find answers to common questions about ChatWithMechanic.com automotive consultation service. Learn about pricing, mechanics, vehicle types, and how our professional chat service works." />
        <meta name="keywords" content="FAQ, frequently asked questions, automotive consultation, mechanic chat help, pricing questions, how it works, vehicle support" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Frequently Asked Questions - ChatWithMechanic.com" />
        <meta property="og:description" content="Find answers to common questions about our automotive consultation service. Professional mechanic chat support FAQ." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/faq" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ - ChatWithMechanic.com" />
        <meta name="twitter:description" content="Frequently asked questions about our professional automotive consultation service." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header user={user as any} onLogin={handleLogin} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <HelpCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Get instant answers to common questions about our professional automotive consultation service. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  How much does ChatWithMechanic cost?
                </AccordionTrigger>
                <AccordionContent>
                  We offer three flexible pricing plans:
                  <br/><br/>
                  <strong>Basic Plan - $14.99:</strong> 1 day of chat access with certified mechanics
                  <br/><br/>
                  <strong>Professional Plan - $49.99:</strong> 30 days of unlimited priority chat access with faster response times
                  <br/><br/>
                  <strong>Expert Plan - $79.99:</strong> Unlimited access with premium features, priority support, and dedicated expert consultations
                  <br/><br/>
                  All plans cover cars, trucks, motorcycles, boats, buses, and construction equipment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What types of vehicles do you support?
                </AccordionTrigger>
                <AccordionContent>
                  We provide expert advice for all types of vehicles including cars, trucks, motorcycles, boats and watercraft, buses, and construction equipment. Our certified mechanics have experience across all vehicle categories and can help with engine diagnostics, maintenance, repairs, and troubleshooting.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Are your mechanics really certified?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, all our mechanics are ASE (Automotive Service Excellence) certified or hold equivalent professional certifications. We verify all credentials and experience before mechanics join our platform. Our team includes specialists in automotive, marine, heavy equipment, and motorcycle repair.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Is the service available 24/7?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, our chat service is available 24 hours a day, 7 days a week. We have mechanics in different time zones to ensure you can get help whenever you need it, whether it's an emergency breakdown or routine maintenance questions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Can I upload photos and videos of my vehicle problem?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely! You can upload images up to 30MB and videos up to 150MB to help our mechanics better understand your vehicle's issue. Visual aids greatly improve the accuracy of diagnostics and recommendations. All uploaded files are automatically deleted after 30 days for your privacy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  What kind of problems can you help me diagnose?
                </AccordionTrigger>
                <AccordionContent>
                  Our mechanics can help with a wide range of issues including engine problems, transmission issues, electrical system faults, brake concerns, cooling system problems, strange noises, performance issues, maintenance scheduling, and emergency troubleshooting. If it's vehicle-related, we can probably help!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Do you provide repair instructions?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, our mechanics can provide step-by-step repair guidance for DIY-friendly repairs. However, for safety reasons, we'll always recommend professional service for complex repairs, brake work, or any safety-critical systems. We prioritize your safety above all else.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  Can you help with preventive maintenance?
                </AccordionTrigger>
                <AccordionContent>
                  Definitely! Our mechanics can help you create maintenance schedules, recommend service intervals, explain what to look for during inspections, and advise on the best practices to keep your vehicle running smoothly and prevent costly repairs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">
                  Is my personal information secure?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we take privacy very seriously. All chat conversations are encrypted, uploaded files are automatically deleted after 30 days, and we never share your personal information with third parties. Your data is protected with industry-standard security measures.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">
                  What if I'm not satisfied with the service?
                </AccordionTrigger>
                <AccordionContent>
                  Customer satisfaction is our top priority. If you're not completely satisfied with our service, please contact our support team at support@chatwithmechanic.com within 7 days of your purchase. We'll work with you to resolve any concerns and ensure you get the help you need.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">
                  Can I get help for vintage or classic vehicles?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! Our team includes mechanics with experience in classic and vintage vehicles. Whether you have a 1960s muscle car, a classic motorcycle, or vintage construction equipment, we have specialists who understand older vehicle systems and can provide appropriate guidance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">
                  How do I get started?
                </AccordionTrigger>
                <AccordionContent>
                  Getting started is easy! Simply fill out the vehicle information form on our homepage, choose your preferred plan (Basic $14.99, Professional $49.99, or Expert $79.99), complete the secure payment, create your account, and you'll immediately have access to chat with certified mechanics. The entire process takes less than 5 minutes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is ready to help you with any questions 
              about our automotive consultation service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" data-testid="link-contact-support">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Contact Support
                </Button>
              </Link>
              <Link href="/" data-testid="link-start-chat">
                <Button size="lg" className="text-lg px-8 py-3">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Chat Now - From $14.99
                </Button>
              </Link>
            </div>
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