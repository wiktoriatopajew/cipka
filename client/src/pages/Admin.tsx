import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { useMechanicsCount } from "@/hooks/useMechanicsCount";
import ScrollToTop from "@/components/ScrollToTop";
import { 
  Users, 
  MessageCircle, 
  DollarSign, 
  Settings, 
  Activity, 
  TrendingUp,
  Clock,
  Wrench,
  Car,
  Database,
  Server
} from "lucide-react";

interface User {
  username: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  subscriptionDaysLeft?: number;
}

interface SystemStats {
  totalUsers: number;
  activeChats: number;
  totalRevenue: number;
  onlineMechanics: number;
  responseTimes: string;
  serverUptime: string;
  databaseStatus: string;
  systemLoad: number;
}

interface RecentActivity {
  id: string;
  type: 'chat_started' | 'payment' | 'mechanic_joined';
  description: string;
  timestamp: Date;
  amount?: number;
}

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const mechanicsCount = useMechanicsCount(); // Use global mechanics count

  // Simple admin access control - in production, use proper authentication
  const handleAdminLogin = () => {
    if (password === 'admin123') {
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Password:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
                data-testid="input-admin-password"
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full" data-testid="button-admin-login">
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [user] = useState<User>({ username: 'Admin', email: 'support@chatwithmechanic.com', isAdmin: true });
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1247,
    activeChats: 23,
    totalRevenue: 15420.50,
    onlineMechanics: mechanicsCount, // Use the global count
    responseTimes: "2.3 min avg",
    serverUptime: "99.98%",
    databaseStatus: "Connected",
    systemLoad: 67
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'payment',
      description: 'User alex_johnson completed payment for premium chat',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      amount: 9.99
    },
    {
      id: '2',
      type: 'chat_started',
      description: 'New chat session started for 2018 Honda Civic engine issue',
      timestamp: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      id: '3',
      type: 'mechanic_joined',
      description: 'Mechanic jamie_tech came online',
      timestamp: new Date(Date.now() - 18 * 60 * 1000)
    },
    {
      id: '4',
      type: 'payment',
      description: 'User mike_car_owner completed payment for premium chat',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      amount: 9.99
    },
    {
      id: '5',
      type: 'chat_started',
      description: 'New chat session started for 2005 Ford F-150 brake issue',
      timestamp: new Date(Date.now() - 35 * 60 * 1000)
    }
  ]);

  // Update stats when mechanicsCount changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      onlineMechanics: mechanicsCount
    }));
  }, [mechanicsCount]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeChats: Math.max(15, Math.floor(Math.random() * 30) + 15),
        onlineMechanics: mechanicsCount, // Always sync with global count
        systemLoad: Math.floor(Math.random() * 40) + 50,
        totalRevenue: prev.totalRevenue + (Math.random() > 0.7 ? 9.99 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [mechanicsCount]); // Depend on mechanicsCount to update when it changes

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-4 h-4 text-success" />;
      case 'chat_started':
        return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'mechanic_joined':
        return <Wrench className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogin={() => {}} 
        onLogout={() => {}} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance, user activity, and manage the platform
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold" data-testid="text-total-users">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                  <p className="text-2xl font-bold" data-testid="text-active-chats">{stats.activeChats}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl font-bold" data-testid="text-revenue">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Online Mechanics</p>
                  <p className="text-2xl font-bold" data-testid="text-online-mechanics">{stats.onlineMechanics}</p>
                </div>
                <Wrench className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Server Uptime</span>
                      <Badge variant="default" className="bg-success/20 text-success border-success/30">
                        {stats.serverUptime}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge variant="default" className="bg-success/20 text-success border-success/30">
                        {stats.databaseStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">System Load</span>
                      <span className="text-sm">{stats.systemLoad}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${stats.systemLoad}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-sm font-mono">{stats.responseTimes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          {activity.amount && (
                            <Badge variant="secondary" className="text-xs">
                              +${activity.amount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="w-4 h-4 mr-2" />
                    Mechanic Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Monitoring
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Database Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chat Completion Rate</span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span>4.8/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payment Success</span>
                      <span>98%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ScrollToTop />
      </div>
    </div>
  );
}