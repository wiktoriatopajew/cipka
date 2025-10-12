import React from 'react';
import { useLocation } from 'wouter';
import { XCircle, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentCancelled() {
  const [, setLocation] = useLocation();

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');
  const token = urlParams.get('token');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-6">
            
            {/* Cancelled State */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <XCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-yellow-900 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-yellow-700 mb-6">
                Your payment was cancelled. No charges were made to your account.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return to Home
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Try Payment Again
                </Button>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• If you're having trouble with payments, try using a different payment method</p>
                <p>• Make sure your browser allows popups from our site</p>
                <p>• Check that JavaScript is enabled in your browser</p>
                <p>• Contact our support team if you continue to experience issues</p>
              </div>
              
              <Button 
                onClick={() => setLocation('/contact')}
                variant="ghost"
                className="mt-3 p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
              >
                Contact Support →
              </Button>
            </div>

            {/* Payment Details (if available) */}
            {token && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Session Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Session ID:</strong> {token}</p>
                  {source && <p><strong>Payment Method:</strong> {source}</p>}
                  <p><strong>Status:</strong> Cancelled</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}