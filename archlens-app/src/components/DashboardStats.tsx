"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Shield, AlertTriangle, DollarSign, Activity, Database, Clock, Target } from "lucide-react";

interface DashboardStatsData {
  totalAnalyses: number;
  recentAnalyses: number;
  averageScores: {
    avgSecurity: number;
    avgResilience: number;
    avgCostEfficiency: number;
    avgCompliance: number;
  };
  environmentDistribution: Array<{ _id: string; count: number }>;
  riskDistribution: Array<{ _id: string; count: number }>;
  timestamp: string;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-success-light';
    if (score >= 60) return 'bg-warning-light';
    return 'bg-error-light';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-6 text-center">
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
    );
  }

  if (!stats) return null;

  const totalRisks = stats.riskDistribution.reduce((sum, item) => sum + item.count, 0);
  const highRisks = stats.riskDistribution.find(item => item._id === 'high')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Analyses */}
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Analyses</h3>
              <p className="text-xs text-foreground-muted">All time</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalAnalyses}</div>
          <div className="text-sm text-foreground-muted mt-1">
            {stats.recentAnalyses} in last 30 days
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <p className="text-xs text-foreground-muted">Last 30 days</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.recentAnalyses}</div>
          <div className="text-sm text-foreground-muted mt-1">
            {stats.totalAnalyses > 0 ? 
              `${Math.round((stats.recentAnalyses / stats.totalAnalyses) * 100)}% of total` : 
              'No data available'
            }
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Risks</h3>
              <p className="text-xs text-foreground-muted">Identified issues</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalRisks}</div>
          <div className="text-sm text-error mt-1">
            {highRisks} high severity
          </div>
        </div>

        {/* Average Security Score */}
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getScoreBackground(stats.averageScores.avgSecurity)}`}>
              <Shield className={`w-5 h-5 ${getScoreColor(stats.averageScores.avgSecurity)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Avg Security</h3>
              <p className="text-xs text-foreground-muted">Security score</p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(stats.averageScores.avgSecurity)}`}>
            {Math.round(stats.averageScores.avgSecurity)}
          </div>
          <div className="text-sm text-foreground-muted mt-1">/100</div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resilience Score */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getScoreBackground(stats.averageScores.avgResilience)}`}>
              <TrendingUp className={`w-4 h-4 ${getScoreColor(stats.averageScores.avgResilience)}`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Resilience</h4>
              <p className="text-xs text-foreground-muted">System reliability</p>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScores.avgResilience)}`}>
              {Math.round(stats.averageScores.avgResilience)}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.averageScores.avgResilience >= 80 ? 'bg-success' :
                stats.averageScores.avgResilience >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${stats.averageScores.avgResilience}%` }}
            ></div>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getScoreBackground(stats.averageScores.avgCostEfficiency)}`}>
              <DollarSign className={`w-4 h-4 ${getScoreColor(stats.averageScores.avgCostEfficiency)}`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Cost Efficiency</h4>
              <p className="text-xs text-foreground-muted">Resource optimization</p>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScores.avgCostEfficiency)}`}>
              {Math.round(stats.averageScores.avgCostEfficiency)}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.averageScores.avgCostEfficiency >= 80 ? 'bg-success' :
                stats.averageScores.avgCostEfficiency >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${stats.averageScores.avgCostEfficiency}%` }}
            ></div>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getScoreBackground(stats.averageScores.avgCompliance)}`}>
              <Target className={`w-4 h-4 ${getScoreColor(stats.averageScores.avgCompliance)}`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Compliance</h4>
              <p className="text-xs text-foreground-muted">Regulatory standards</p>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScores.avgCompliance)}`}>
              {Math.round(stats.averageScores.avgCompliance)}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.averageScores.avgCompliance >= 80 ? 'bg-success' :
                stats.averageScores.avgCompliance >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${stats.averageScores.avgCompliance}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Environment & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Environment Distribution</span>
          </h3>
          <div className="space-y-3">
            {stats.environmentDistribution.length > 0 ? (
              stats.environmentDistribution.map((env) => (
                <div key={env._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      env._id === 'production' ? 'bg-error' :
                      env._id === 'staging' ? 'bg-warning' :
                      'bg-info'
                    }`}></div>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {env._id || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-foreground">{env.count}</span>
                    <div className="text-xs text-foreground-muted">
                      {stats.totalAnalyses > 0 ? 
                        `${Math.round((env.count / stats.totalAnalyses) * 100)}%` : 
                        '0%'
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-foreground-muted text-sm">No environment data available</p>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Risk Severity Distribution</span>
          </h3>
          <div className="space-y-3">
            {stats.riskDistribution.length > 0 ? (
              stats.riskDistribution.map((risk) => (
                <div key={risk._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      risk._id === 'critical' ? 'bg-error' :
                      risk._id === 'high' ? 'bg-error/70' :
                      risk._id === 'medium' ? 'bg-warning' :
                      'bg-info'
                    }`}></div>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {risk._id || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-foreground">{risk.count}</span>
                    <div className="text-xs text-foreground-muted">
                      {totalRisks > 0 ? 
                        `${Math.round((risk.count / totalRisks) * 100)}%` : 
                        '0%'
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-foreground-muted text-sm">No risk data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-foreground-muted">
        Last updated: {new Date(stats.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
