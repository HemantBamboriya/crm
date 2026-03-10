'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isAuthenticated, role, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={isAuthenticated ? (role === 'citizen' ? '/dashboard/citizen' : '/dashboard/employee') : '/'} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground">CivicCRM</span>
        </Link>
        
        <div className="hidden gap-8 md:flex">
          {isAuthenticated && role === 'citizen' && (
            <>
              <Link href="/dashboard/citizen" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/report" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Report Issue
              </Link>
            </>
          )}
          {isAuthenticated && role === 'employee' && (
            <>
              <Link href="/dashboard/employee" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                My Tasks
              </Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          role === 'citizen' ? (
            <Button asChild variant="outline">
              <Link href="/report">Report Issue</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                <span className="text-xs font-semibold text-accent">
                  {user?.rewardPoints ?? 0} pts
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary">Employee</span>
              </div>
            </div>
          )
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
