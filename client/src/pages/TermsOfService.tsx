import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TermsOfService() {
  const [showLogin, setShowLogin] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

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
        <title>Terms of Service - ChatWithMechanic.com</title>
        <meta name="description" content="Read our terms of service to understand the rules and guidelines for using ChatWithMechanic.com services." />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Terms of Service - ChatWithMechanic.com" />
        <meta property="og:description" content="Read our terms of service to understand the rules and guidelines for using ChatWithMechanic.com services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/terms-of-service" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header 
          user={user as any} 
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8" data-testid="heading-terms-of-service">Terms of Service</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using ChatWithMechanic.com, you accept and agree to be bound by the terms 
                  and provisions of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
                <p>
                  ChatWithMechanic.com provides an online platform connecting users with certified automotive 
                  mechanics for consultation and advice. Our service is for informational purposes and should 
                  not replace professional in-person mechanical inspection or repair.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
                <p>As a user of our service, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the service in compliance with all applicable laws</li>
                  <li>Not misuse or abuse the platform or harass mechanics</li>
                  <li>Pay all applicable fees in a timely manner</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Payment Terms</h2>
                <p>
                  Payment for consultations must be made through our platform using approved payment methods. 
                  All fees are non-refundable except as outlined in our Refund Policy. We reserve the right 
                  to change our pricing at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Limitation of Liability</h2>
                <p>
                  The advice provided through our platform is for informational purposes only. We are not 
                  liable for any damages, injuries, or losses resulting from following advice received through 
                  our service. Always consult with a professional mechanic for hands-on inspection and repair.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
                <p>
                  All content on ChatWithMechanic.com, including text, graphics, logos, and software, is the 
                  property of ChatWithMechanic.com and protected by copyright and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Account Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violation of these 
                  terms or for any other reason at our sole discretion. You may cancel your account at any time 
                  through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Dispute Resolution</h2>
                <p>
                  Any disputes arising from these terms or your use of our service will be resolved through 
                  binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material 
                  changes. Your continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                <p>
                  For questions about these terms, please contact us at{" "}
                  <a href="mailto:support@chatwithmechanic.com" className="text-primary hover:underline" data-testid="link-legal-email">
                    support@chatwithmechanic.com
                  </a>
                </p>
              </section>

              <p className="text-sm mt-8">
                <strong>Last Updated:</strong> December 2024
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />
      <ScrollToTop />
    </>
  );
}
