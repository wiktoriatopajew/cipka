import { Star, Users, MessageCircle, Shield, CheckCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMechanicsCount } from "@/hooks/useMechanicsCount";
import { useDynamicStats } from "@/hooks/useDynamicStats";

export default function StatsSection() {
  const onlineMechanicsCount = useMechanicsCount();
  const dynamicStats = useDynamicStats();

  const stats = [
    {
      icon: Users,
      value: dynamicStats.problemsSolved,
      label: "Problems Solved",
      description: "Successfully resolved automotive issues"
    },
    {
      icon: MessageCircle,
      value: dynamicStats.happyCustomers,
      label: "Happy Customers",
      description: "Satisfied users worldwide"
    },
    {
      icon: Shield,
      value: "24/7",
      label: "Expert Support",
      description: "Professional mechanics available"
    },
    {
      icon: Award,
      value: "ASE Certified",
      label: "Qualified Mechanics",
      description: "Industry-certified professionals"
    }
  ];

  const trustBadges = [
    { icon: Shield, text: "SSL Secured" },
    { icon: CheckCircle, text: "Privacy Protected" },
    { icon: Star, text: "4.8/5 Rating" },
    { icon: Award, text: "Industry Certified" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 to-background border-y">
      <div className="container mx-auto px-4">
        {/* Trust Indicators */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.8/5</span>
            <span className="text-muted-foreground">• {dynamicStats.happyCustomers} reviews</span>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="h-4 w-4 text-green-500" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 font-medium">{onlineMechanicsCount} mechanics online now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Live chat with real humans</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Instant responses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Expert mechanics only</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}