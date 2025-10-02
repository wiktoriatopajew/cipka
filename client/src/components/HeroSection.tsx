import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Wrench, Clock, Shield, Star, X, Check, MapPin, DollarSign, Calendar, Users } from "lucide-react";
import heroImage from "@assets/stock_images/mechanic_garage_work_4757d5e8.jpg";
import { useMechanicsCount } from "@/hooks/useMechanicsCount";
import { PricingPlans } from "./PricingPlans";

interface HeroSectionProps {
  onStartChat?: () => void;
  onGetStarted?: () => void;
  onPlanSelect?: (plan: 'basic' | 'professional' | 'expert') => void;
  user?: {
    id: string;
    username: string;
    email: string;
    hasSubscription: boolean;
  };
}

export default function HeroSection({ onStartChat, onGetStarted, onPlanSelect, user }: HeroSectionProps) {
  const onlineMechanicsCount = useMechanicsCount();
  
  // Hide the marketing section if user is logged in and has subscription
  const shouldShowMarketing = !user || !user.hasSubscription;
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Traditional automotive garage workshop" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {shouldShowMarketing && (
            <>
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Chat With Professional
                  <span className="block bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent">
                    Mechanics Online
                  </span>
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed bg-gradient-to-r from-slate-600 via-gray-700 to-slate-600 dark:from-slate-300 dark:via-gray-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Get instant expert advice for cars, motorcycles, boats, buses, construction equipment, and much more. 
                  Available 24/7 from certified professionals. Our mechanics will help solve your vehicle, engine, and mechanical problems 
                  at a fraction of the cost of a workshop visit - no waiting in line required.
                </p>
              </div>

              {/* Value Proposition Cards */}
              <div className="grid md:grid-cols-3 gap-6 my-12">
                <Card className="bg-card/50 backdrop-blur border-border/50 hover-elevate">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Instant Responses</h3>
                    <p className="text-sm text-muted-foreground">Real-time chat with expert mechanics</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-border/50 hover-elevate">
                  <CardContent className="p-6 text-center">
                    <Wrench className="w-8 h-8 text-success mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">All Vehicles</h3>
                    <p className="text-sm text-muted-foreground">Cars, bikes, boats, construction equipment and more</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-border/50 hover-elevate">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-8 h-8 text-warning mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Certified Experts</h3>
                    <p className="text-sm text-muted-foreground">Licensed professional mechanics</p>
                  </CardContent>
                </Card>
              </div>

              {/* Features Comparison */}
              <div className="my-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  Why Choose Us?
                </h2>
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {/* Traditional Garage */}
                  <Card className="bg-card/50 backdrop-blur border-destructive/30 hover:border-destructive/50 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-destructive mb-2 flex items-center justify-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Traditional Garage
                        </h3>
                        <p className="text-sm text-muted-foreground">The old way of getting help</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">Wait days for appointment</span>
                        </div>
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">$100-200+ per visit</span>
                        </div>
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">Limited business hours</span>
                        </div>
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">Travel to location required</span>
                        </div>
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">One mechanic's opinion</span>
                        </div>
                        <div className="flex items-center text-destructive">
                          <X className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm">No instant communication</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AutoMentor Online */}
                  <Card className="bg-gradient-to-br from-primary/10 to-warning/10 backdrop-blur border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-primary mb-2 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Online Expert Chat
                        </h3>
                        <p className="text-sm text-muted-foreground">The smart way to get expert help</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Instant chat access</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Only from $14.99 - Professional advice</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">24/7 availability</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">From comfort of your home</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Multiple expert opinions</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Real-time problem solving</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pricing Plans Section */}
              <div id="pricing-plans-section" className="mt-16">
                <PricingPlans onPlanSelect={onPlanSelect} />
              </div>

              {/* Main CTA */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary/20 to-warning/20 backdrop-blur rounded-2xl p-8 border border-primary/30">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-success" />
                    <span className="text-success font-medium" data-testid="text-mechanics-online-count">{onlineMechanicsCount} mechanics online now</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      Plans from <span className="text-primary">$14.99</span>
                      <span className="text-lg font-normal text-muted-foreground ml-2">choose what works for you</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-primary-foreground font-semibold px-8 py-3"
                        onClick={onStartChat}
                        data-testid="button-start-chat"
                      >
                        Start Chatting Now
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="backdrop-blur border-primary/30 hover:bg-primary/10"
                        onClick={onGetStarted}
                        data-testid="button-learn-more"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Expert Verified</span>
                </div>
              </div>
            </>
          )}

          {/* Show welcome message for subscribed users */}
          {user && user.hasSubscription && (
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent">{user.username}</span>!
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                You have unlimited access to our expert mechanics. Start a new chat or continue an existing conversation.
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-success" />
                <span className="text-success font-medium" data-testid="text-mechanics-online-count">{onlineMechanicsCount} mechanics online now</span>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-primary-foreground font-semibold px-8 py-3"
                onClick={onStartChat}
              >
                Return to Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}