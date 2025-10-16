import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { usePageTracking } from "@/hooks/usePageTracking";
import Home from "@/pages/Home";
import AdminPanel from "@/pages/AdminPanel";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import HowItWorks from "@/pages/HowItWorks";
import MechanicVerification from "@/pages/MechanicVerification";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import RefundPolicy from "@/pages/RefundPolicy";
import CarsAndTrucks from "@/pages/vehicles/CarsAndTrucks";
import Motorcycles from "@/pages/vehicles/Motorcycles";
import BoatsAndWatercraft from "@/pages/vehicles/BoatsAndWatercraft";
import Buses from "@/pages/vehicles/Buses";
import RVAndCampers from "@/pages/vehicles/RVAndCampers";
import ConstructionEquipment from "@/pages/vehicles/ConstructionEquipment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancelled from "@/pages/PaymentCancelled";
import NotFound from "@/pages/not-found";

function Router() {
  // Enable page view tracking
  usePageTracking();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPanel} />
      
      {/* Support Pages */}
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/mechanic-verification" component={MechanicVerification} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/refund-policy" component={RefundPolicy} />
      
      {/* Vehicle Type Pages */}
      <Route path="/vehicles/cars-trucks" component={CarsAndTrucks} />
      <Route path="/vehicles/motorcycles" component={Motorcycles} />
      <Route path="/vehicles/boats-watercraft" component={BoatsAndWatercraft} />
      <Route path="/vehicles/buses" component={Buses} />
      <Route path="/vehicles/rv-campers" component={RVAndCampers} />
      <Route path="/vehicles/construction-equipment" component={ConstructionEquipment} />
      
      {/* Payment Pages */}
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-cancelled" component={PaymentCancelled} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
