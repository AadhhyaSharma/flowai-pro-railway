import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import {
  Menu,
  X,
  LayoutDashboard,
  Workflow,
  History,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';

interface DarkLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showToolbar?: boolean;
  toolbarActions?: React.ReactNode;
}

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Workflow, label: 'Editor', href: '/editor' },
  { icon: History, label: 'History', href: '/history' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DarkLayout({
  children,
  title,
  subtitle,
  showToolbar = true,
  toolbarActions,
}: DarkLayoutProps) {
  const { user, logout, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">FlowAI Pro</h1>
          <p className="mb-6 text-muted">Workflow Automation Platform</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:z-auto lg:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-secondary">
            <Workflow className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">FlowAI</span>
          <span className="ml-auto text-[10px] font-medium text-accent">PRO</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top toolbar */}
        {showToolbar && (
          <div className="toolbar">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Title */}
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="truncate text-lg font-semibold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="truncate text-xs text-muted">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Toolbar actions */}
            {toolbarActions && <div className="flex items-center gap-2">{toolbarActions}</div>}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
