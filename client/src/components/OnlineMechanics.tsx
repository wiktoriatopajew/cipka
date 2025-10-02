import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Circle } from "lucide-react";
import { useMechanicsCount, useGlobalMechanics } from "@/hooks/useMechanicsCount";

interface Mechanic {
  id: string;
  username: string;
  responseTime: string;
  isOnline: boolean;
  isBusy?: boolean;
  sessionStart: number;
  sessionDuration: number; // in milliseconds
}

interface OnlineMechanicsProps {
  className?: string;
}

export default function OnlineMechanics({ className }: OnlineMechanicsProps) {
  const onlineCount = useMechanicsCount(); // Available mechanics count (not busy)
  const globalMechanics = useGlobalMechanics(); // Global mechanics list from server
  
  // Calculate local counts for display
  const availableCount = globalMechanics.filter((m: any) => m.isOnline && !m.isBusy).length;
  const displayCount = availableCount > 0 ? availableCount : onlineCount; // Fallback to hook value

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Available Mechanics</span>
          <Badge className="bg-success/20 text-success border-success/30" data-testid="badge-online-count">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            {displayCount} Available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {globalMechanics.map((mechanic: any) => (
            <div 
              key={mechanic.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate"
              data-testid={`mechanic-${mechanic.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {mechanic.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {mechanic.isOnline && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      mechanic.isBusy ? 'bg-yellow-500' : 'bg-success'
                    }`} />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm" data-testid={`text-username-${mechanic.id}`}>
                    {mechanic.username}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Response: {mechanic.responseTime}
                </div>
                <Badge 
                  variant={!mechanic.isBusy ? "default" : "secondary"}
                  className={
                    !mechanic.isBusy 
                      ? "bg-success/20 text-success border-success/30" 
                      : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                  }
                >
                  {mechanic.isBusy ? "Busy" : "Available"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}