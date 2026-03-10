'use client';

import { Navbar } from '@/components/navbar';
import { KPIStatCard } from '@/components/kpi-stat-card';
import { Card } from '@/components/ui/card';
import { mockAnalytics, mockComplaints } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MoreVertical,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const categoryData = Object.entries(mockAnalytics.categoryBreakdown).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const COLORS = ['#1E7A87', '#87CEEB', '#20B2AA', '#5F9EA0'];

  const statusData = Object.entries(mockAnalytics.statusBreakdown).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const resolutionRate = (
    (mockAnalytics.resolvedComplaints /
      (mockAnalytics.resolvedComplaints + mockAnalytics.pendingComplaints)) *
    100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              System analytics and performance metrics
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* KPI Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPIStatCard
            icon={AlertCircle}
            label="Total Issues"
            value={mockAnalytics.totalComplaints}
            subtext="All time"
            trend="up"
            trendValue="+156 this month"
          />
          <KPIStatCard
            icon={CheckCircle}
            label="Resolved Issues"
            value={mockAnalytics.resolvedComplaints}
            subtext={`${resolutionRate}% resolution rate`}
            trend="up"
            trendValue="+12% this month"
          />
          <KPIStatCard
            icon={Clock}
            label="Pending Issues"
            value={mockAnalytics.pendingComplaints}
            subtext="Awaiting action"
            trend="down"
            trendValue="-8 from yesterday"
          />
          <KPIStatCard
            icon={TrendingUp}
            label="Avg Resolution Time"
            value={mockAnalytics.avgResolutionTime}
            subtext="Days"
            trend="up"
            trendValue="Improved 0.3 days"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Monthly Trend Chart */}
          <Card className="border-border p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground">Monthly Trend</h3>
            <p className="text-sm text-muted-foreground">Complaints and resolutions over time</p>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#1F2937' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#1E7A87"
                    strokeWidth={2}
                    dot={{ fill: '#1E7A87', r: 4 }}
                    name="Total Complaints"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#20B2AA"
                    strokeWidth={2}
                    dot={{ fill: '#20B2AA', r: 4 }}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="border-border p-6">
            <h3 className="text-lg font-semibold text-foreground">Issues by Category</h3>
            <p className="text-sm text-muted-foreground">Distribution across departments</p>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Distribution */}
          <Card className="border-border p-6">
            <h3 className="text-lg font-semibold text-foreground">Issues by Status</h3>
            <p className="text-sm text-muted-foreground">Current status breakdown</p>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#1E7A87" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border mt-8 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Reports</h3>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-foreground py-3">Title</th>
                  <th className="text-left font-semibold text-foreground py-3">Category</th>
                  <th className="text-left font-semibold text-foreground py-3">Status</th>
                  <th className="text-left font-semibold text-foreground py-3">Priority</th>
                  <th className="text-left font-semibold text-foreground py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3">
                      <p className="font-medium text-foreground">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground">{complaint.location}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{complaint.category}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          complaint.status === 'Resolved'
                            ? 'bg-accent/10 text-accent'
                            : complaint.status === 'In Progress'
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          complaint.priority === 'Critical'
                            ? 'bg-destructive/10 text-destructive'
                            : complaint.priority === 'Medium'
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{complaint.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
