'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { KPIStatCard } from '@/components/kpi-stat-card';
import { ComplaintCard } from '@/components/complaint-card';
import { Button } from '@/components/ui/button';
import { mockComplaints, mockAnalytics } from '@/lib/mock-data';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const recentComplaints = mockComplaints.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
                Report & Track Public Issues
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                A modern platform for citizens to report infrastructure issues and track resolution progress. Help improve your community with transparent reporting.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href={isAuthenticated ? '/report' : '/login'}>
                    {isAuthenticated ? 'Report an Issue' : 'Get Started'}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/map">View Map</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-card p-6 border border-border shadow-lg">
                    <div className="text-3xl font-bold text-primary">{mockAnalytics.totalComplaints}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Total Issues</div>
                  </div>
                  <div className="rounded-lg bg-card p-6 border border-border shadow-lg">
                    <div className="text-3xl font-bold text-accent">{mockAnalytics.resolvedComplaints}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Resolved</div>
                  </div>
                  <div className="rounded-lg bg-card p-6 border border-border shadow-lg">
                    <div className="text-3xl font-bold text-destructive">{mockAnalytics.criticalIssues}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Critical</div>
                  </div>
                  <div className="rounded-lg bg-card p-6 border border-border shadow-lg">
                    <div className="text-3xl font-bold text-secondary">{mockAnalytics.avgResolutionTime}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Avg. Resolution</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Platform Overview</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPIStatCard
              icon={AlertCircle}
              label="Pending Issues"
              value={mockAnalytics.pendingComplaints}
              subtext="Awaiting resolution"
              trend="up"
              trendValue="+12 this week"
            />
            <KPIStatCard
              icon={CheckCircle}
              label="Resolved This Month"
              value={mockAnalytics.resolvedComplaints}
              subtext="71% resolution rate"
              trend="up"
              trendValue="+8% from last month"
            />
            <KPIStatCard
              icon={Clock}
              label="Avg Resolution Time"
              value={mockAnalytics.avgResolutionTime}
              subtext="Improved by 0.3 days"
              trend="up"
              trendValue="Better response"
            />
            <KPIStatCard
              icon={TrendingUp}
              label="Response Rate"
              value="94%"
              subtext="Community engagement"
              trend="neutral"
              trendValue="Consistent"
            />
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Recently Reported Issues</h2>
            <Button variant="outline" asChild>
              <Link href="/map">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {recentComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Help Improve Your Community
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Report infrastructure issues and track progress in real-time. Your feedback matters.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-8">
            <Link href={isAuthenticated ? '/report' : '/login'}>
              {isAuthenticated ? 'Report an Issue Now' : 'Login to Report'}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold text-foreground">CivicCRM</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Empowering communities through transparent reporting.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Platform</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li><Link href="/report" className="hover:text-primary">Report Issue</Link></li>
                <li><Link href="/map" className="hover:text-primary">Track Issues</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
                <li><a href="#" className="hover:text-primary">Guidelines</a></li>
                <li><a href="#" className="hover:text-primary">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CivicCRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
