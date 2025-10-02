import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageCircle, 
  Download,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
// import { DatePickerWithRange } from './ui/date-picker';
// import { DateRange } from 'react-day-picker';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalRevenue: number;
  totalSubscriptions: number;
  newSubscriptions: number;
  totalSessions: number;
  conversionRate: number;
}

interface RevenueAnalytics {
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
  topCustomers: Array<{
    userId: string;
    totalSpent: number;
    subscriptionCount: number;
  }>;
}

interface ChartData {
  labels: string[];
  data: number[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [chartType, setChartType] = useState<'users' | 'revenue' | 'chats'>('users');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
      if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
      
      const response = await fetch(`/api/admin/analytics/dashboard?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch revenue analytics
  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery<RevenueAnalytics>({
    queryKey: ['revenueAnalytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
      if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
      
      const response = await fetch(`/api/admin/analytics/revenue?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch revenue analytics');
      return response.json();
    }
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery<ChartData>({
    queryKey: ['chartData', chartType, chartPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/charts/${chartType}?period=${chartPeriod}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    }
  });

  const exportData = async (type: 'dashboard' | 'revenue') => {
    try {
      const data = type === 'dashboard' ? dashboardStats : revenueAnalytics;
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatChartData = (chartData: ChartData) => {
    return chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.data[index]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 3.8); // Convert PLN to USD (approximate rate)
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (statsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select 
            value="30days" 
            onValueChange={(value) => {
              const days = value === '7days' ? 7 : value === '30days' ? 30 : 365;
              setDateRange({
                from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                to: new Date()
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="365days">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportData('dashboard')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.newUsers || 0} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardStats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.newSubscriptions || 0} subscriptions this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(dashboardStats?.conversionRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Users to subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trends Over Time
                </CardTitle>
                <CardDescription>
                  Track key metrics across different time periods
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={chartType} onValueChange={setChartType as any}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="chats">Chats</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartPeriod} onValueChange={setChartPeriod as any}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatChartData(chartData || { labels: [], data: [] })}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      {revenueAnalytics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Detailed revenue breakdown and customer insights
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => exportData('revenue')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Revenue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueAnalytics.totalRevenue)}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {revenueAnalytics.transactionCount}
                </div>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueAnalytics.averageOrderValue)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
              </div>
            </div>

            {/* Revenue Chart */}
            {revenueAnalytics.revenueByPeriod.length > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueAnalytics.revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Customers */}
      {revenueAnalytics?.topCustomers && revenueAnalytics.topCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Highest value customers by total spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueAnalytics.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">User {customer.userId.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.subscriptionCount} subscriptions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}