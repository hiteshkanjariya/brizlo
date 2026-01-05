import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/store/hooks';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const areaChartData = [
  { name: 'Jan', value: 2400, prev: 2000 },
  { name: 'Feb', value: 1398, prev: 1800 },
  { name: 'Mar', value: 9800, prev: 5000 },
  { name: 'Apr', value: 3908, prev: 3200 },
  { name: 'May', value: 4800, prev: 4000 },
  { name: 'Jun', value: 3800, prev: 3500 },
  { name: 'Jul', value: 4300, prev: 3800 },
];

const barChartData = [
  { name: 'Mon', users: 45, sessions: 120 },
  { name: 'Tue', users: 52, sessions: 145 },
  { name: 'Wed', users: 49, sessions: 138 },
  { name: 'Thu', users: 63, sessions: 175 },
  { name: 'Fri', users: 58, sessions: 160 },
  { name: 'Sat', users: 32, sessions: 85 },
  { name: 'Sun', users: 28, sessions: 72 },
];

const pieData = [
  { name: 'Desktop', value: 62, color: 'hsl(var(--primary))' },
  { name: 'Mobile', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Tablet', value: 10, color: 'hsl(var(--chart-3))' },
];

const recentActivity = [
  { id: 1, user: 'Sarah Johnson', action: 'Updated user permissions', time: '2 min ago', type: 'update', avatar: 'SJ' },
  { id: 2, user: 'Michael Chen', action: 'Created new report', time: '5 min ago', type: 'create', avatar: 'MC' },
  { id: 3, user: 'Emily Davis', action: 'Deleted inactive users', time: '12 min ago', type: 'delete', avatar: 'ED' },
  { id: 4, user: 'James Wilson', action: 'Exported data to CSV', time: '25 min ago', type: 'export', avatar: 'JW' },
  { id: 5, user: 'Olivia Brown', action: 'Changed system settings', time: '1 hour ago', type: 'update', avatar: 'OB' },
];

const topPerformers = [
  { name: 'John Smith', role: 'Sales Lead', value: '$48,250', growth: '+12%' },
  { name: 'Lisa Anderson', role: 'Marketing', value: '$36,800', growth: '+8%' },
  { name: 'David Kim', role: 'Support', value: '$28,400', growth: '+15%' },
];

const stats = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    description: 'vs last month',
    gradient: 'from-blue-500/20 to-blue-600/10',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Active Sessions',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: Activity,
    description: 'currently online',
    gradient: 'from-green-500/20 to-green-600/10',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    title: 'Revenue',
    value: '$54,320',
    change: '+23.1%',
    trend: 'up',
    icon: DollarSign,
    description: 'vs last month',
    gradient: 'from-purple-500/20 to-purple-600/10',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Growth Rate',
    value: '18.2%',
    change: '-2.4%',
    trend: 'down',
    icon: TrendingUp,
    description: 'quarterly avg',
    gradient: 'from-orange-500/20 to-orange-600/10',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
];

const activityTypeColors: Record<string, string> = {
  update: 'bg-blue-500',
  create: 'bg-green-500',
  delete: 'bg-red-500',
  export: 'bg-purple-500',
};

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
            </div>
            <p className="text-muted-foreground">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${stat.trend === 'up'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                      } border`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground/70">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart - spans 2 columns */}
          <Card className="lg:col-span-2 border-0 shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px hsl(var(--foreground) / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="prev"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorPrev)"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Distribution */}
          <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '250ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Device Distribution</CardTitle>
              <CardDescription>Traffic by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Activity Chart */}
          <Card className="lg:col-span-2 border-0 shadow-lg animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">User Activity</CardTitle>
                <CardDescription>Daily active users and sessions</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px hsl(var(--foreground) / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Bar
                      dataKey="users"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                      name="Users"
                    />
                    <Bar
                      dataKey="sessions"
                      fill="hsl(var(--primary) / 0.3)"
                      radius={[6, 6, 0, 0]}
                      name="Sessions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '350ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
                <CardDescription>This month's leaders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Eye className="h-3 w-3" />
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.name}
                  className="flex items-center gap-4 rounded-xl bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">{performer.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{performer.value}</p>
                    <p className="text-xs text-success">{performer.growth}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest actions performed in the system</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <Eye className="h-3 w-3" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 bg-gradient-to-r from-card to-card/50 p-4 transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${activityTypeColors[activity.type]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs font-normal">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
