import { Link } from "wouter";
import { MessageCircle, Mail, Shield, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-warning">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">
                ChatWithMechanic
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional automotive advice for all vehicles. Get expert help from certified mechanics online.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:support@chatwithmechanic.com" className="text-muted-foreground hover:text-primary" data-testid="link-footer-email">
                support@chatwithmechanic.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Vehicle Types</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vehicles/cars-trucks" className="hover:text-primary" data-testid="link-footer-cars-trucks">Cars & Trucks</Link></li>
              <li><Link href="/vehicles/motorcycles" className="hover:text-primary" data-testid="link-footer-motorcycles">Motorcycles</Link></li>
              <li><Link href="/vehicles/boats-watercraft" className="hover:text-primary" data-testid="link-footer-boats">Boats & Watercraft</Link></li>
              <li><Link href="/vehicles/buses" className="hover:text-primary" data-testid="link-footer-buses">Buses</Link></li>
              <li><Link href="/vehicles/rv-campers" className="hover:text-primary" data-testid="link-footer-rv">RV & Campers</Link></li>
              <li><Link href="/vehicles/construction-equipment" className="hover:text-primary" data-testid="link-footer-construction">Construction Equipment</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary" data-testid="link-footer-contact">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary" data-testid="link-footer-faq">FAQ</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary" data-testid="link-footer-how-it-works">How It Works</Link></li>
              <li><Link href="/mechanic-verification" className="hover:text-primary" data-testid="link-footer-verification">Mechanic Verification</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-success" />
                <span className="text-muted-foreground">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Certified Mechanics</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MessageCircle className="w-4 h-4 text-warning" />
                <span className="text-muted-foreground">Instant Responses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            © 2025 ChatWithMechanic.com. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-primary" data-testid="link-footer-privacy">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary" data-testid="link-footer-terms">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-primary" data-testid="link-footer-refund">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}