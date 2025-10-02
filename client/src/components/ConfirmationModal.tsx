import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Check, AlertTriangle, Car, DollarSign, Calendar } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangePlan: () => void;
  selectedPlan: 'basic' | 'professional' | 'expert';
  vehicleInfo: {
    year?: string;
    make?: string;
    model?: string;
    engineSize?: string;
    description?: string;
  } | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  onChangePlan,
  selectedPlan,
  vehicleInfo
}) => {
  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'basic':
        return {
          name: 'Basic Plan',
          price: '$14.99',
          duration: '1 day access',
          features: ['1 day of chat access', 'Chat with certified mechanics', 'All vehicle types supported', 'Photo upload support', 'Quick help & tips'],
          icon: '📦'
        };
      case 'professional':
        return {
          name: 'Professional Plan',
          price: '$49.99',
          duration: '30 days unlimited',
          features: ['30 days of unlimited access', 'Priority chat support', 'Faster response times', 'All vehicle types supported', 'Photo & document upload'],
          icon: '⭐'
        };
      case 'expert':
        return {
          name: 'Expert Plan',
          price: '$79.99',
          duration: '360 days access',
          features: ['360 days of access', 'Dedicated expert consultations', 'Priority support (24/7)', 'Advanced diagnostics', 'Technical documentation access'],
          icon: '👑'
        };
      default:
        return {
          name: 'Basic Plan',
          price: '$14.99',
          duration: '1 day access',
          features: ['1 day of chat access', 'Chat with certified mechanics', 'All vehicle types supported', 'Photo upload support', 'Quick help & tips'],
          icon: '📦'
        };
    }
  };

  const planDetails = getPlanDetails(selectedPlan);
  const vehicleDisplay = vehicleInfo 
    ? `${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}`.trim()
    : 'Vehicle information';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Confirm Your Selection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{planDetails.icon}</span>
                  <div>
                    <h3 className="font-semibold">{planDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{planDetails.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{planDetails.price}</div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center mb-3 p-2 bg-muted/50 rounded">
                <Car className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{vehicleDisplay}</span>
              </div>

              {/* Problem Description */}
              {vehicleInfo?.description && (
                <div className="mb-3 p-2 bg-muted/50 rounded">
                  <p className="text-sm text-muted-foreground">Issue: {vehicleInfo.description}</p>
                </div>
              )}

              {/* Features */}
              <div className="space-y-1">
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="flex items-start p-3 bg-warning/10 border border-warning/20 rounded">
            <AlertTriangle className="w-4 h-4 mr-2 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning-foreground">
              After confirmation, you'll be redirected to payment processing.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onChangePlan} className="w-full sm:w-auto">
            Change Plan
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1 sm:flex-initial">
              Confirm & Pay
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};