"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChecklistManager } from "@/components/ChecklistManager";
import { Settings, Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface ChecklistStats {
  totalItems: number;
  enabledItems: number;
  disabledItems: number;
  categoryStats: Array<{ _id: string; count: number; enabled: number }>;
  priorityStats: Array<{ _id: string; count: number; enabled: number }>;
  timestamp: string;
}

export default function ConfigPage() {
  const [stats, setStats] = useState<ChecklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checklist?action=stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch checklist statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatsUpdate = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Configuration
              </h1>
              <p className="text-lg text-foreground-muted mt-1">
                Manage evaluation checklists and system settings
              </p>
            </div>
          </div>

          {/* Statistics Overview */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-error-light border border-error/20 rounded-xl p-6 mb-8 text-center">
              <AlertTriangle className="w-8 h-8 text-error mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-error mb-2">Failed to Load Statistics</h3>
              <p className="text-error/80 mb-4">{error}</p>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Items */}
              <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Total Items</h3>
                    <p className="text-xs text-foreground-muted">All checklist items</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stats.totalItems}</div>
                <div className="text-sm text-foreground-muted mt-1">
                  Across {stats.categoryStats.length} categories
                </div>
              </div>

              {/* Enabled Items */}
              <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Enabled</h3>
                    <p className="text-xs text-foreground-muted">Active in evaluations</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-success">{stats.enabledItems}</div>
                <div className="text-sm text-foreground-muted mt-1">
                  {stats.totalItems > 0 ? Math.round((stats.enabledItems / stats.totalItems) * 100) : 0}% of total
                </div>
              </div>

              {/* Disabled Items */}
              <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Disabled</h3>
                    <p className="text-xs text-foreground-muted">Inactive items</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-warning">{stats.disabledItems}</div>
                <div className="text-sm text-foreground-muted mt-1">
                  {stats.totalItems > 0 ? Math.round((stats.disabledItems / stats.totalItems) * 100) : 0}% of total
                </div>
              </div>

              {/* High Priority Items */}
              <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">High Priority</h3>
                    <p className="text-xs text-foreground-muted">Critical items</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-error">
                  {stats.priorityStats.find(p => p._id === 'High')?.count || 0}
                </div>
                <div className="text-sm text-foreground-muted mt-1">
                  {stats.priorityStats.find(p => p._id === 'High')?.enabled || 0} enabled
                </div>
              </div>
            </div>
          )}

          {/* Checklist Manager */}
          <div className="bg-surface border border-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Evaluation Checklist</h2>
              <p className="text-foreground-muted mt-1">
                Manage the checklist items used during architecture evaluations. These items will be referenced during analysis to ensure comprehensive coverage.
              </p>
            </div>
            
            <ChecklistManager onStatsUpdate={handleStatsUpdate} />
          </div>
        </div>
      </main>
    </div>
  );
}
