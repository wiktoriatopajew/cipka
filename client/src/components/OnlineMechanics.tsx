import React, { useState, useEffect, useMemo, useRef } from "react";
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
  disableAutoScroll?: boolean; // Add prop to disable auto-scroll behavior
}

function OnlineMechanicsComponent({ className, disableAutoScroll = false }: OnlineMechanicsProps) {
  const onlineCount = useMechanicsCount(); // Available mechanics count (not busy)
  const globalMechanics = useGlobalMechanics(); // Always get mechanics (they update every 2 min)
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Save scroll position before mechanics update (if disableAutoScroll is true)
  useEffect(() => {
    if (disableAutoScroll && containerRef.current) {
      const container = containerRef.current.querySelector('.space-y-3.max-h-96.overflow-y-auto') as HTMLElement;
      if (container) {
        setScrollPosition(container.scrollTop);
      }
    }
  }, [globalMechanics, disableAutoScroll]);
  
  // Restore scroll position after mechanics update (if disableAutoScroll is true)
  useEffect(() => {
    if (disableAutoScroll && containerRef.current && scrollPosition > 0) {
      const container = containerRef.current.querySelector('.space-y-3.max-h-96.overflow-y-auto') as HTMLElement;
      if (container) {
        container.scrollTop = scrollPosition;
      }
    }
  }, [globalMechanics, scrollPosition, disableAutoScroll]);
  
  // Memoize the mechanics list to prevent unnecessary re-renders
  const stableMechanics = useMemo(() => {
    return globalMechanics.map((mechanic: any) => ({
      id: mechanic.id,
      username: mechanic.username,
      responseTime: mechanic.responseTime,
      isOnline: mechanic.isOnline,
      isBusy: mechanic.isBusy
    }));
  }, [globalMechanics]);
  
  // Calculate local counts for display
  const availableCount = stableMechanics.filter((m: any) => m.isOnline && !m.isBusy).length;
  const displayCount = availableCount > 0 ? availableCount : onlineCount; // Fallback to hook value

  return (
    <Card className={className} ref={containerRef}>
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
          {stableMechanics.map((mechanic: any) => (
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

// Memoize component to prevent unnecessary re-renders that could cause scroll
export default React.memo(OnlineMechanicsComponent);