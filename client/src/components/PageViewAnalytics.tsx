import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface PageViewStats {
  totalPageViews: number;
  uniqueVisitors: number;
  pagesByUrl: { url: string; views: number }[];
  viewsByPeriod: { period: string; views: number }[];
}

interface VisitorStats {
  byCountry: { country: string; visitors: number }[];
  byCity: { city: string; country: string; visitors: number }[];
  byDevice: { device: string; visitors: number }[];
  byBrowser: { browser: string; visitors: number }[];
  byOS: { os: string; visitors: number }[];
}

export default function PageViewAnalytics() {
  const [period, setPeriod] = useState('30days');
  const [groupBy, setGroupBy] = useState('day');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch page view stats
  const { data: pageViewStats, isLoading: pageViewsLoading } = useQuery<PageViewStats>({
    queryKey: ['pageViewStats', startDate, endDate, groupBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
        groupBy
      });
      
      const response = await fetch(`/api/admin/analytics/pageviews?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch page view stats');
      return response.json();
    }
  });

  // Fetch visitor stats
  const { data: visitorStats, isLoading: visitorsLoading } = useQuery<VisitorStats>({
    queryKey: ['visitorStats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      const response = await fetch(`/api/admin/analytics/visitors?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch visitor stats');
      return response.json();
    }
  });

  if (pageViewsLoading || visitorsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statystyki Odwiedzin</h2>
          <p className="text-muted-foreground">
            Analiza ruchu na stronie i pochodzenie odwiedzających
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
              <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
              <SelectItem value="365days">Ostatni rok</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dziennie</SelectItem>
              <SelectItem value="month">Miesięcznie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Całkowite wyświetlenia</p>
                <p className="text-2xl font-bold">{pageViewStats?.totalPageViews.toLocaleString() || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unikalni odwiedzający</p>
                <p className="text-2xl font-bold">{pageViewStats?.uniqueVisitors.toLocaleString() || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Średnio na odwiedzającego</p>
                <p className="text-2xl font-bold">
                  {pageViewStats?.uniqueVisitors 
                    ? (pageViewStats.totalPageViews / pageViewStats.uniqueVisitors).toFixed(1)
                    : '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Wyświetlenia w czasie</CardTitle>
          <CardDescription>Liczba wyświetleń strony w wybranym okresie</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pageViewStats?.viewsByPeriod || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#8884d8" name="Wyświetlenia" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Najpopularniejsze strony</CardTitle>
          <CardDescription>Najczęściej odwiedzane strony</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pageViewStats?.pagesByUrl.slice(0, 10).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{page.url}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(page.views / (pageViewStats.pagesByUrl[0]?.views || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right">{page.views}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Odwiedzający według kraju
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitorStats?.byCountry.slice(0, 10).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{country.country}</span>
                  <span className="text-sm font-semibold">{country.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cities */}
        <Card>
          <CardHeader>
            <CardTitle>Top miasta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitorStats?.byCity.slice(0, 10).map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{city.city}, {city.country}</span>
                  <span className="text-sm font-semibold">{city.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Typy urządzeń
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={visitorStats?.byDevice || []}
                  dataKey="visitors"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {visitorStats?.byDevice.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>Przeglądarki</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={visitorStats?.byBrowser || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operating Systems */}
      <Card>
        <CardHeader>
          <CardTitle>Systemy operacyjne</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={visitorStats?.byOS || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="os" width={100} />
              <Tooltip />
              <Bar dataKey="visitors" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
