"use client";

import { useState, useEffect } from "react";
import { Cloud, Shield, Zap, Activity, CheckCircle, AlertCircle, XCircle, Settings, Bell, Home, BarChart3, FileText, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  currentClient: {
    provider: string;
    model: string;
    available: boolean;
  } | null;
  providerCount: number;
}

export function Header() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
      setSystemStatus({
        status: 'error',
        message: 'Failed to check status',
        currentClient: null,
        providerCount: 0
      });
    }
  };

  const getStatusIcon = () => {
    if (!systemStatus) return <Activity className="w-4 h-4 animate-pulse" />;
    
    switch (systemStatus.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };


  return (
    <header className="bg-surface border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-active text-primary-foreground shadow-md">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">CloudArc</h1>
              <p className="text-sm text-foreground-muted font-medium">Enterprise Cloud Architecture Review</p>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname === '/'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/analyses"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname === '/analyses'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analyses</span>
            </Link>
            
            <Link
              href="/configuration"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname.startsWith('/configuration')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuration</span>
            </Link>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Navigation & Status Section */}
          <div className="flex items-center space-x-6">
            {/* Feature Indicators */}
            
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
                {systemStatus?.status === 'error' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface"></span>
                )}
              </button>
              
              {/* Settings */}
              <Link 
                href="/config"
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200"
                title="Configuration"
              >
                <Settings className="w-5 h-5" />
              </Link>
              
              {/* LLM Status Indicator */}
              <div className="relative">
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
                    systemStatus?.status === 'healthy' 
                      ? 'bg-success-light border-success/20 text-success hover:bg-success-light/80' 
                      : systemStatus?.status === 'warning'
                      ? 'bg-warning-light border-warning/20 text-warning hover:bg-warning-light/80'
                      : 'bg-error-light border-error/20 text-error hover:bg-error-light/80'
                  }`}
                >
                  {getStatusIcon()}
                  <div className="text-left">
                    <div className="text-sm font-semibold">
                      {systemStatus?.currentClient?.provider?.toUpperCase() || 'LLM'}
                    </div>
                    <div className="text-xs opacity-80">
                      {systemStatus?.providerCount ? `${systemStatus.providerCount} providers` : 'No providers'}
                    </div>
                  </div>
                </button>
                
                {showStatus && systemStatus && (
                  <div className="absolute right-0 top-full mt-3 w-96 bg-surface-elevated border border-border rounded-xl shadow-xl p-6 z-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">System Status</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        systemStatus.status === 'healthy' 
                          ? 'bg-success-light border-success/20 text-success' 
                          : systemStatus.status === 'warning'
                          ? 'bg-warning-light border-warning/20 text-warning'
                          : 'bg-error-light border-error/20 text-error'
                      }`}>
                        {systemStatus.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-foreground-muted">Active Provider</div>
                          <div className="font-medium text-foreground">
                            {systemStatus.currentClient?.provider?.toUpperCase() || 'None'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-foreground-muted">Available Count</div>
                          <div className="font-medium text-foreground">{systemStatus.providerCount}</div>
                        </div>
                      </div>
                      
                      {systemStatus.currentClient && (
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          <div className="font-medium text-foreground mb-1">Current Model</div>
                          <div className="text-foreground-muted font-mono text-xs">
                            {systemStatus.currentClient.model}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="text-foreground-muted">
                          {systemStatus.message}
                        </div>
                      </div>
                      
                      <button
                        onClick={checkSystemStatus}
                        className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors text-sm font-medium"
                      >
                        Refresh Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-surface-elevated">
            <nav className="container mx-auto px-6 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  pathname === '/'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/analyses"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  pathname === '/analyses'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analyses</span>
              </Link>
              
              <Link
                href="/configuration"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  pathname.startsWith('/configuration')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Configuration</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
