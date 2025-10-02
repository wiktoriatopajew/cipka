import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, User, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatSession {
  id: string;
  userId: string;
  vehicleInfo: string;
  status: string;
  createdAt: string;
  lastActivity: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderType: string;
  } | null;
  messageCount: number;
  unreadCount: number;
}

interface ChatHistoryProps {
  onSelectSession: (sessionId: string, vehicleInfo: any) => void;
  onStartNewChat: () => void;
}

export default function ChatHistory({ onSelectSession, onStartNewChat }: ChatHistoryProps) {
  const { data: sessions = [], isLoading, error } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
    refetchOnWindowFocus: false,
  });

  const parseVehicleInfo = (vehicleInfoJson: string) => {
    try {
      return JSON.parse(vehicleInfoJson || '{}');
    } catch {
      return {};
    }
  };

  const getVehicleDisplayName = (vehicleInfo: any) => {
    if (!vehicleInfo || Object.keys(vehicleInfo).length === 0) {
      return "General Consultation";
    }
    
    const { year, make, model, type } = vehicleInfo;
    const parts = [year, make, model].filter(Boolean);
    
    if (parts.length > 0) {
      return parts.join(" ");
    }
    
    return type || "Vehicle Consultation";
  };

  const truncateMessage = (content: string, maxLength: number = 60) => {
    if (!content) return "";
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "admin":
        return <Wrench className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your Chat History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your Chat History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Unable to load chat history
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your Chat History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No previous chats</h3>
            <p className="text-muted-foreground mb-4">
              Start your first consultation with our mechanics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Your Chat History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => {
            const vehicleInfo = parseVehicleInfo(session.vehicleInfo);
            const vehicleDisplayName = getVehicleDisplayName(vehicleInfo);

            return (
              <Card 
                key={session.id} 
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => onSelectSession(session.id, vehicleInfo)}
                data-testid={`chat-session-${session.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">
                      {vehicleDisplayName}
                    </h4>
                    <div className="flex items-center gap-2">
                      {session.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="text-xs px-2 py-1"
                          data-testid={`badge-unread-${session.id}`}
                        >
                          {session.unreadCount}
                        </Badge>
                      )}
                      <Badge 
                        variant={session.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                        data-testid={`badge-status-${session.id}`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {session.lastMessage && (
                    <div className="flex items-center gap-2 mb-2">
                      {getSenderIcon(session.lastMessage.senderType)}
                      <p className="text-sm text-muted-foreground flex-1">
                        {truncateMessage(session.lastMessage.content)}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {session.messageCount} messages
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}