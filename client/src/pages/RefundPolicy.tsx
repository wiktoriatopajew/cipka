import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RefundPolicy() {
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
        <title>Refund Policy - ChatWithMechanic.com</title>
        <meta name="description" content="Learn about our refund policy and the conditions under which refunds are provided for ChatWithMechanic.com services." />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Refund Policy - ChatWithMechanic.com" />
        <meta property="og:description" content="Learn about our refund policy and the conditions under which refunds are provided for ChatWithMechanic.com services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/refund-policy" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header 
          user={user as any} 
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8" data-testid="heading-refund-policy">Refund Policy</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
                <p>
                  At ChatWithMechanic.com, we strive to provide high-quality automotive consultation services. 
                  This refund policy outlines the conditions under which refunds may be issued.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Consultation Refunds</h2>
                <p>
                  Refunds for individual consultations may be provided under the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The mechanic failed to respond within 24 hours</li>
                  <li>Technical issues prevented the consultation from occurring</li>
                  <li>The consultation was of unsatisfactory quality (subject to review)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Subscription Refunds</h2>
                <p>
                  Subscription refunds are handled as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full refund within 7 days of initial purchase if no consultations were used</li>
                  <li>Prorated refunds may be available for cancelled subscriptions</li>
                  <li>No refunds for the final month of a subscription period</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Non-Refundable Items</h2>
                <p>The following are not eligible for refunds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Completed consultations where advice was provided</li>
                  <li>Services used more than 30 days ago</li>
                  <li>Fees for failed payment processing</li>
                  <li>Promotional or discounted services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Refund Request Process</h2>
                <p>To request a refund:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at support@chatwithmechanic.com</li>
                  <li>Provide your account information and transaction details</li>
                  <li>Explain the reason for your refund request</li>
                  <li>Allow 5-7 business days for review and processing</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Processing Time</h2>
                <p>
                  Approved refunds will be processed within 7-10 business days. The refund will be issued to 
                  the original payment method used for the purchase. Please allow additional time for your 
                  financial institution to process the refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Partial Refunds</h2>
                <p>
                  In certain situations, partial refunds may be granted at our discretion. This may apply to 
                  cases where service was partially delivered or issues were partially resolved.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Chargebacks</h2>
                <p>
                  If you initiate a chargeback with your payment provider without first contacting us, your 
                  account may be suspended pending resolution. We encourage you to work with us directly to 
                  resolve any payment disputes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
                <p>
                  We reserve the right to modify this refund policy at any time. Changes will be effective 
                  immediately upon posting to our website. Your continued use of our services after changes 
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                <p>
                  For questions about refunds or to request a refund, please contact us at{" "}
                  <a href="mailto:support@chatwithmechanic.com" className="text-primary hover:underline" data-testid="link-refund-email">
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
