import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyPolicy() {
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
        <title>Privacy Policy - ChatWithMechanic.com</title>
        <meta name="description" content="Read our privacy policy to understand how ChatWithMechanic.com collects, uses, and protects your personal information." />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Privacy Policy - ChatWithMechanic.com" />
        <meta property="og:description" content="Read our privacy policy to understand how ChatWithMechanic.com collects, uses, and protects your personal information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatwithmechanic.com/privacy-policy" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header 
          user={user as any} 
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8" data-testid="heading-privacy-policy">Privacy Policy</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us when you create an account, use our services, 
                  or communicate with us. This includes your name, email address, and any information you share 
                  in your conversations with mechanics.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Connect you with qualified mechanics</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Process payments and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
                <p>
                  We do not share your personal information with third parties except as described in this policy. 
                  We may share information with mechanics to facilitate your consultations, with service providers 
                  who assist in our operations, and when required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to collect information about your browsing 
                  activities and improve your experience on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by 
                  posting the new policy on this page and updating the effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
                <p>
                  If you have questions about this privacy policy, please contact us at{" "}
                  <a href="mailto:support@chatwithmechanic.com" className="text-primary hover:underline" data-testid="link-privacy-email">
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
