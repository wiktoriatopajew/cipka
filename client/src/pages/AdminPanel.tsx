import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, MessageCircle, DollarSign, Activity, Send, 
  Eye, Clock, Shield, AlertCircle, CheckCircle2, Image, Video, FileText, Paperclip, Ban, Play, Search, X, Plus, BarChart3, FileEdit
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import CMSPanel from "@/components/CMSPanel";
import { useToast } from "@/hooks/use-toast";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAdsPanel from "@/components/GoogleAdsPanel";
import { useChatSounds } from "@/utils/chatSounds";
import AppConfigPanel from "@/components/AppConfigPanel";

interface AdminData {
  stats: {
    totalUsers: number;
    subscribedUsers: number;
    onlineUsers: number;
    activeChats: number;
    unreadMessages: number;
    totalRevenue: number;
  };
  users: any[];
  subscriptions: any[];
  activeSessions: any[];
  unreadMessages: any[];
  recentMessages: any[];
}

interface ChatSession {
  id: string;
  user?: any;
  lastMessage?: any;
  unreadCount: number;
  messageCount: number;
  vehicleInfo?: string;
  status: string;
  createdAt: string;
  lastActivity: string;
}

interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  sender?: any;
  createdAt: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [addingDaysUserId, setAddingDaysUserId] = useState<string | null>(null);
  const [daysToAdd, setDaysToAdd] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playMessageSent, playMessageReceived, initializeAudio } = useChatSounds();
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/dashboard");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Auto logout when user leaves the page (simplified approach)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable logout - it works even when page is closing
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
        navigator.sendBeacon('/api/admin/logout', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated]);

  // Heartbeat to keep session alive and detect disconnects
  useEffect(() => {
    if (!isAuthenticated) return;

    const heartbeat = setInterval(async () => {
      try {
        const response = await apiRequest("POST", "/api/admin/heartbeat");
        if (!response.ok) {
          // If heartbeat fails, user might be disconnected
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('Heartbeat failed:', error);
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(heartbeat);
    };
  }, [isAuthenticated]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", creds);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome to admin panel",
      });
    },
    onError: () => {
      toast({
        title: "Login failed", 
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Dashboard data query
  const { data: dashboardData, refetch: refetchDashboard } = useQuery<AdminData>({
    queryKey: ["/api/admin/dashboard"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Chat sessions query
  const { data: chatSessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/chats"],
    enabled: isAuthenticated,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Messages for selected chat
  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/admin/chats", selectedChatId, "messages"],
    enabled: isAuthenticated && !!selectedChatId,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Live data query
  const { data: liveData } = useQuery<{
    unreadCount: number;
    activeChatsCount: number;
    onlineUsersCount: number;
    lastUpdate: string;
  }>({
    queryKey: ["/api/admin/live-data"],
    enabled: isAuthenticated,
    refetchInterval: 1000, // Refresh every second
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content, attachmentId }: { sessionId: string; content: string; attachmentId?: string }) => {
      const response = await apiRequest("POST", `/api/admin/chats/${sessionId}/messages`, { 
        content, 
        ...(attachmentId && { attachmentId }) 
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      refetchDashboard();
      playMessageSent();
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
      refetchDashboard();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout");
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setCredentials({ email: "", password: "" });
      toast({
        title: "Logged out successfully",
        description: "See you!",
      });
      window.location.href = '/';
    },
    onError: () => {
      toast({
        title: "Logout error",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logoutMutation.mutate();
        toast({
          title: "Session expired",
          description: "You have been logged out due to inactivity",
          variant: "destructive",
        });
      }, INACTIVITY_TIME);
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, logoutMutation, toast]);

  // Block/Unblock user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/block`, { isBlocked });
      return response.json();
    },
    onSuccess: () => {
      refetchDashboard();
      toast({
        title: "Status użytkownika zaktualizowany",
        description: "Zmiany zostały zapisane",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu użytkownika",
        variant: "destructive",
      });
    },
  });

  // Add subscription days mutation
  const addSubscriptionDaysMutation = useMutation({
    mutationFn: async ({ userId, days }: { userId: string; days: number }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/add-days`, { days });
      return response.json();
    },
    onSuccess: () => {
      refetchDashboard();
      setAddingDaysUserId(null);
      setDaysToAdd("");
      toast({
        title: "Dni subskrypcji dodane",
        description: "Subskrypcja użytkownika została przedłużona",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać dni subskrypcji",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      loginMutation.mutate(credentials);
    }
  };

  const handleAddDays = (userId: string) => {
    const days = parseInt(daysToAdd);
    if (days > 0 && days <= 365) {
      addSubscriptionDaysMutation.mutate({ userId, days });
    } else {
      toast({
        title: "Błąd",
        description: "Wprowadź liczbę dni między 1 a 365",
        variant: "destructive",
      });
    }
  };

  const handleCancelAddDays = () => {
    setAddingDaysUserId(null);
    setDaysToAdd("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChatId) {
      sendMessageMutation.mutate({
        sessionId: selectedChatId,
        content: newMessage.trim(),
      });
    }
  };

  // Initialize audio on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [initializeAudio]);

  // Detect new messages for sound notification
  useEffect(() => {
    if (messages && messages.length > 0) {
      if (previousMessageCount > 0 && messages.length > previousMessageCount) {
        // New message received
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.senderType === 'user') {
          // Message from user to admin
          playMessageReceived();
        }
      }
      setPreviousMessageCount(messages.length);
    }
  }, [messages, previousMessageCount, playMessageReceived]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (uploadResult) => {
      if (selectedChatId) {
        sendMessageMutation.mutate({
          sessionId: selectedChatId,
          content: `📎 ${uploadResult.originalName}`,
          attachmentId: uploadResult.id,
        });
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only images and videos are allowed",
        variant: "destructive",
      });
      return;
    }

    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 30 * 1024 * 1024 : 150 * 1024 * 1024; // 30MB for images, 150MB for videos
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum size is ${isImage ? '30MB' : '150MB'} for ${isImage ? 'images' : 'videos'}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    uploadFileMutation.mutate(file);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US");
  };

  const calculateSubscriptionDays = (expiresAt: string) => {
    if (!expiresAt) return 0;
    const expiryDate = new Date(expiresAt);
    const currentDate = new Date();
    const diffTime = expiryDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Return 0 if expired
  };

  // Filter users based on search query
  const filteredUsers = dashboardData?.users.filter((user: any) => {
    if (!userSearchQuery.trim()) return true;
    
    const searchLower = userSearchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Filter chats based on search query
  const filteredChats = chatSessions?.filter((session: any) => {
    if (!chatSearchQuery.trim()) return true;
    
    const searchLower = chatSearchQuery.toLowerCase();
    return (
      session.user?.username?.toLowerCase().includes(searchLower) ||
      session.user?.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const renderAttachment = (attachment: Attachment) => {
    const isImage = attachment.mimeType.startsWith('image/');
    const isVideo = attachment.mimeType.startsWith('video/');

    if (isImage) {
      return (
        <div className="mt-2">
          <img 
            src={`/api/uploads/${attachment.fileName}`}
            alt={attachment.originalName}
            className="max-w-xs rounded-lg border border-white/20"
            style={{ maxHeight: '200px' }}
          />
          <p className="text-xs opacity-70 mt-1">
            {attachment.originalName} ({formatFileSize(attachment.fileSize)})
          </p>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2">
          <video 
            src={`/api/uploads/${attachment.fileName}`}
            controls
            className="max-w-xs rounded-lg border border-white/20"
            style={{ maxHeight: '200px' }}
          />
          <p className="text-xs opacity-70 mt-1">
            {attachment.originalName} ({formatFileSize(attachment.fileSize)})
          </p>
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 border border-white/20 rounded-lg flex items-center space-x-2 bg-white/10">
        {getFileIcon(attachment.mimeType)}
        <div className="flex-1">
          <p className="text-sm font-medium">{attachment.originalName}</p>
          <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
        </div>
      </div>
    );
  };

  const getVehicleInfo = (vehicleInfoString?: string) => {
    try {
      return vehicleInfoString ? JSON.parse(vehicleInfoString) : null;
    } catch {
      return null;
    }
  };

  // Play notification sound for new user messages
  const prevMessagesCount = useRef(messages?.length || 0);
  useEffect(() => {
    if (messages && messages.length > prevMessagesCount.current) {
      const newMessages = messages.slice(prevMessagesCount.current);
      const hasUserMessage = newMessages.some(msg => msg.senderType === "user");
      
      if (hasUserMessage) {
        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmm98OScTgwOUKfk77RgGgU7k9r0yHMpBSh+zPLaizsKGGS56+mmUBELTKXh8bllHAU2jdXz0n0uBSqAzvLajDkIGGe88eyeUQ0PUqjl8LJeGQQ8lNv0yHUpBSh+zPDciz0KF2S56+mjUhEKS6Xg8bllHAU3jtb00oA');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Audio play failed:', err));
      }
    }
    prevMessagesCount.current = messages?.length || 0;
  }, [messages]);

  // Auto-mark messages as read when viewing chat
  useEffect(() => {
    if (messages && selectedChatId) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderType === "user"
      );
      unreadMessages.forEach((msg) => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [messages, selectedChatId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email:</label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  placeholder="Enter admin email"
                  data-testid="input-admin-email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password:</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="Enter admin password"
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span>Online</span>
              </div>
              <Badge variant="secondary">
                {liveData?.unreadCount || 0} unread
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-admin-logout"
              >
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chats" className="relative" data-testid="tab-chats">
              Chats
              {(liveData?.unreadCount || 0) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {liveData?.unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="cms" data-testid="tab-cms">
              <FileEdit className="w-4 h-4 mr-2" />
              CMS
            </TabsTrigger>
            <TabsTrigger value="googleads" data-testid="tab-googleads">Google Ads</TabsTrigger>
            <TabsTrigger value="appconfig" data-testid="tab-appconfig">Konfiguracja</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wszyscy użytkownicy</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-users">
                    {dashboardData?.stats.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktywne czaty</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-chats">
                    {dashboardData?.stats.activeChats || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Przychody</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-revenue">
                    {formatCurrency(dashboardData?.stats.totalRevenue || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-online-users">
                    {dashboardData?.stats.onlineUsers || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ostatnie wiadomości</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {dashboardData?.recentMessages.map((message: any) => (
                        <div key={message.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.senderType === "admin" ? "A" : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {message.senderType === "admin" ? "Mechanic" : (message.sender?.username || "Użytkownik")}
                              </span>
                              <Badge variant={message.senderType === "admin" ? "default" : "secondary"}>
                                {message.senderType === "admin" ? "Admin" : "User"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subskrypcje użytkowników</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {dashboardData?.users
                        .filter((user: any) => user.hasSubscription)
                        .map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={user.isOnline ? "default" : "secondary"}
                                className={user.isOnline ? "bg-success/20 text-success border-success/30" : ""}
                              >
                                {user.isOnline ? "Online" : "Offline"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 250px)' }}>
              {/* Chat Sessions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktywne czaty ({filteredChats?.length || 0})</CardTitle>
                  <div className="mt-3">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Szukaj po nicku użytkownika..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {chatSearchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChatSearchQuery("")}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {chatSearchQuery && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Znaleziono {filteredChats.length} czatów dla "{chatSearchQuery}"
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 p-4">
                      {filteredChats.length > 0 ? (
                        filteredChats.map((session) => {
                          const vehicleInfo = getVehicleInfo(session.vehicleInfo);
                        return (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedChatId === session.id
                                ? "bg-primary/10 border-primary"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedChatId(session.id)}
                            data-testid={`chat-session-${session.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {session.user?.username?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {session.user?.username || "Nieznany użytkownik"}
                                  </p>
                                  {vehicleInfo && (
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">
                                        {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                                      </p>
                                      {vehicleInfo.type && (
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="secondary" className="text-xs px-1 py-0">
                                            {vehicleInfo.type}
                                          </Badge>
                                          {vehicleInfo.engine && (
                                            <span className="text-xs text-muted-foreground">
                                              {vehicleInfo.engine}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {session.user?.isOnline && (
                                  <Badge variant="default" className="text-xs">
                                    <div className="w-2 h-2 bg-white rounded-full mr-1" />
                                    Online
                                  </Badge>
                                )}
                                {session.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                    {session.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {session.lastMessage && (
                              <p className="text-xs text-muted-foreground mt-2 truncate">
                                {session.lastMessage.content}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {session.messageCount} wiadomości
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(session.lastActivity)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {chatSearchQuery ? 
                            `Nie znaleziono czatów dla "${chatSearchQuery}"` : 
                            "Brak aktywnych czatów"
                          }
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Messages */}
              <div className="lg:col-span-2 h-full">
                {selectedChatId ? (
                  <Card className="h-full flex flex-col relative">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">Konwersacja</span>
                          <Badge variant="outline">
                            {messages?.length || 0} wiadomości
                          </Badge>
                        </div>
                        {(() => {
                          const selectedSession = chatSessions?.find(s => s.id === selectedChatId);
                          const selectedVehicleInfo = getVehicleInfo(selectedSession?.vehicleInfo);
                          return selectedSession && selectedVehicleInfo ? (
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {selectedSession.user?.username?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {selectedSession.user?.username || "Nieznany użytkownik"}
                                </span>
                                {selectedSession.user?.isOnline && (
                                  <Badge variant="default" className="text-xs">
                                    <div className="w-2 h-2 bg-white rounded-full mr-1" />
                                    Online
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedVehicleInfo.type || 'Nieznany typ'}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {selectedVehicleInfo.year} {selectedVehicleInfo.make} {selectedVehicleInfo.model}
                                  </span>
                                </div>
                                {selectedVehicleInfo.engine && (
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Silnik:</strong> {selectedVehicleInfo.engine}
                                  </p>
                                )}
                                {selectedVehicleInfo.issue && (
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Problem:</strong> {selectedVehicleInfo.issue.length > 100 
                                      ? selectedVehicleInfo.issue.substring(0, 100) + '...' 
                                      : selectedVehicleInfo.issue
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full p-0 overflow-hidden">
                      {/* Messages */}
                      <div className="p-4 overflow-y-auto" style={{ height: '500px' }}>
                        <div className="space-y-4">
                          {messages?.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderType === "admin" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg space-y-1 ${
                                  message.senderType === "admin"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                    : "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs bg-white/20 text-white">
                                      {message.senderType === "admin" ? "A" : (message.sender?.username?.charAt(0).toUpperCase() || "U")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium">
                                    {message.senderType === "admin" ? "Admin" : (message.sender?.username || "User")}
                                  </span>
                                  <span className="text-xs opacity-70 ml-auto">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                                {message.attachments && message.attachments.map((attachment) => (
                                  <div key={attachment.id}>
                                    {renderAttachment(attachment)}
                                  </div>
                                ))}
                                {message.senderType === "user" && !message.isRead && (
                                  <div className="flex items-center text-xs opacity-80">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Unread
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="border-t p-4 flex-shrink-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          data-testid="input-admin-file-upload"
                        />
                        
                        {/* File Upload Button - More Visible */}
                        <div className="mb-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadFileMutation.isPending}
                            className="w-full"
                            data-testid="button-admin-file-upload-main"
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            {uploadFileMutation.isPending ? "Wysyłanie pliku..." : "Wyślij plik do użytkownika"}
                          </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadFileMutation.isPending}
                            data-testid="button-admin-file-upload"
                            title="Wyślij plik"
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Input
                            placeholder="Napisz wiadomość..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            data-testid="input-admin-message"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            data-testid="button-send-admin-message"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        {uploadFileMutation.isPending && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Wysyłanie pliku...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent>
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>Wybierz czat aby rozpocząć konwersację</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zarządzanie użytkownikami</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj użytkowników po nicku lub emailu..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {userSearchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserSearchQuery("")}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {userSearchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Znaleziono {filteredUsers.length} użytkowników dla "{userSearchQuery}"
                    </p>
                  )}
                </div>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => {
                        const userSubscription = dashboardData?.subscriptions.find(sub => sub.userId === user.id && sub.status === 'active');
                        const daysLeft = userSubscription ? calculateSubscriptionDays(userSubscription.expiresAt) : 0;
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {user.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Utworzony: {formatDate(user.createdAt)}
                              </p>
                              {user.hasSubscription && (
                                <p className="text-xs font-medium text-blue-600">
                                  Subskrypcja: {daysLeft} dni pozostało
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col space-y-1">
                              <div className="flex space-x-2">
                                <Badge variant={user.isOnline ? "default" : "secondary"}>
                                  {user.isOnline ? "Online" : "Offline"}
                                </Badge>
                                <Badge variant={user.hasSubscription ? "default" : "outline"}>
                                  {user.hasSubscription ? "Premium" : "Free"}
                                </Badge>
                              </div>
                              {user.isBlocked && (
                                <Badge variant="destructive" className="text-xs">
                                  Zablokowany
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={user.isBlocked ? "default" : "destructive"}
                              onClick={() => blockUserMutation.mutate({ 
                                userId: user.id, 
                                isBlocked: !user.isBlocked 
                              })}
                            >
                              {user.isBlocked ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Odblokuj
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Zablokuj
                                </>
                              )}
                            </Button>
                            
                            {/* Add subscription days control */}
                            {addingDaysUserId === user.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  placeholder="Dni"
                                  value={daysToAdd}
                                  onChange={(e) => setDaysToAdd(e.target.value)}
                                  className="w-20 h-8"
                                  min="1"
                                  max="365"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddDays(user.id)}
                                  disabled={addSubscriptionDaysMutation.isPending}
                                >
                                  {addSubscriptionDaysMutation.isPending ? "..." : "OK"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelAddDays}
                                  disabled={addSubscriptionDaysMutation.isPending}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAddingDaysUserId(user.id)}
                                title="Dodaj dni subskrypcji"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Dni
                              </Button>
                            )}
                            
                            {user.isOnline && !user.isBlocked && (
                              <div className="w-2 h-2 bg-success rounded-full" />
                            )}
                          </div>
                        </div>
                      );
                    })) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {userSearchQuery ? 
                          `Nie znaleziono użytkowników dla "${userSearchQuery}"` : 
                          "Brak użytkowników"
                        }
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historia subskrypcji</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {dashboardData?.subscriptions.map((subscription: any) => {
                      const user = dashboardData.users.find(u => u.id === subscription.userId);
                      const daysLeft = calculateSubscriptionDays(subscription.expiresAt);
                      return (
                        <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user?.username || "Nieznany użytkownik"}</p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Zakupiono: {formatDate(subscription.purchasedAt)}
                              </p>
                              <p className="text-xs font-medium text-blue-600">
                                Pozostało dni: {daysLeft} {daysLeft === 0 ? "(Wygasła)" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-bold">{formatCurrency(parseFloat(subscription.amount || "0"))}</p>
                            <div className="flex flex-col space-y-1">
                              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                                {subscription.status}
                              </Badge>
                              {user && (
                                <Button
                                  size="sm"
                                  variant={user.isBlocked ? "default" : "destructive"}
                                  onClick={() => blockUserMutation.mutate({ 
                                    userId: user.id, 
                                    isBlocked: !user.isBlocked 
                                  })}
                                  className="text-xs"
                                >
                                  {user.isBlocked ? (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Odblokuj
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3 h-3 mr-1" />
                                      Zablokuj
                                    </>
                                  )}
                                </Button>
                              )}
                              {user?.isBlocked && (
                                <Badge variant="destructive" className="text-xs">
                                  Zablokowany
                                </Badge>
                              )}
                            </div>
                            {user?.isOnline && !user?.isBlocked && (
                              <div className="flex items-center justify-end mt-1">
                                <div className="w-2 h-2 bg-success rounded-full mr-2" />
                                <span className="text-xs text-success">Online</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

                    <TabsContent value="googleads" className="space-y-6">
            <GoogleAdsPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="cms" className="space-y-6">
            <CMSPanel />
          </TabsContent>

          <TabsContent value="appconfig" className="space-y-6">
            <AppConfigPanel />
          </TabsContent>
        </Tabs>
        <ScrollToTop />
      </div>
    </div>
  );
}