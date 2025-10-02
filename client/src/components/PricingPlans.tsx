import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Check, Clock, Star, Crown } from "lucide-react";

interface PricingPlansProps {
  onPlanSelect?: (plan: 'basic' | 'professional' | 'expert') => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onPlanSelect }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your automotive needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <Card className="relative h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              <CardTitle className="text-xl">Basic</CardTitle>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold">$14.99</span>
            </div>
            <CardDescription>
              Perfect for quick questions and one-time consultations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow min-h-[160px]">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">1 day of chat access</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Chat with certified mechanics</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">All vehicle types supported</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Photo upload support</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Quick help & tips</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onPlanSelect?.('basic')}
            >
              Choose Basic
            </Button>
          </CardFooter>
        </Card>

        {/* Professional Plan */}
        <Card className="relative border-primary shadow-lg h-full flex flex-col">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 mr-2 text-orange-500" />
              <CardTitle className="text-xl">Professional</CardTitle>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold">$49.99</span>
            </div>
            <CardDescription>
              Ideal for ongoing maintenance and multiple consultations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow min-h-[160px]">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">30 days of unlimited access</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Priority chat support</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Faster response times</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">All vehicle types supported</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Photo & document upload</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onPlanSelect?.('professional')}
            >
              Choose Professional
            </Button>
          </CardFooter>
        </Card>

        {/* Expert Plan */}
        <Card className="relative h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Crown className="w-5 h-5 mr-2 text-purple-500" />
              <CardTitle className="text-xl">Expert</CardTitle>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold">$79.99</span>
            </div>
            <CardDescription>
              Premium features for professionals and DIY enthusiasts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow min-h-[160px]">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">360 days of access</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Dedicated expert consultations</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Priority support (24/7)</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Advanced diagnostics</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight whitespace-nowrap">Technical documentation access</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onPlanSelect?.('expert')}
            >
              Choose Expert
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
