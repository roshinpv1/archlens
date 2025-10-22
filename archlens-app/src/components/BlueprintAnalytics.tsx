"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Star, 
  Users, 
  FileText,
  Tag,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalBlueprints: number;
  totalDownloads: number;
  averageRating: number;
  mostPopularCategory: string;
  mostDownloadedBlueprint: string;
  recentUploads: number;
  topTags: Array<{ tag: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  complexityDistribution: Array<{ complexity: string; count: number; percentage: number }>;
  monthlyStats: Array<{ month: string; uploads: number; downloads: number }>;
  topContributors: Array<{ name: string; uploads: number; downloads: number }>;
}

export function BlueprintAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/blueprints/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Available</h3>
        <p className="text-foreground-muted">Analytics data will appear here once blueprints are uploaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-foreground-muted">Total Blueprints</div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalBlueprints}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-foreground-muted">Total Downloads</div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalDownloads.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-foreground-muted">Average Rating</div>
              <div className="text-2xl font-bold text-foreground">{analytics.averageRating.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-foreground-muted">Recent Uploads</div>
              <div className="text-2xl font-bold text-foreground">{analytics.recentUploads}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {analytics.categoryDistribution.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: `hsl(${index * 40}, 70%, 50%)` }} />
                  <span className="text-sm text-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted">{item.count}</span>
                  <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complexity Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Complexity Distribution</h3>
          <div className="space-y-3">
            {analytics.complexityDistribution.map((item, index) => (
              <div key={item.complexity} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    item.complexity === 'Low' ? 'bg-green-500' :
                    item.complexity === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-foreground capitalize">{item.complexity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted">{item.count}</span>
                  <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tags and Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Tags</h3>
          <div className="space-y-2">
            {analytics.topTags.map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm text-foreground">{tag.tag}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {analytics.topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{contributor.name}</div>
                    <div className="text-xs text-foreground-muted">
                      {contributor.uploads} uploads • {contributor.downloads} downloads
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <Award className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-foreground-muted">Month</th>
                <th className="text-left py-2 text-sm font-medium text-foreground-muted">Uploads</th>
                <th className="text-left py-2 text-sm font-medium text-foreground-muted">Downloads</th>
                <th className="text-left py-2 text-sm font-medium text-foreground-muted">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyStats.map((stat, index) => (
                <tr key={stat.month} className="border-b border-border">
                  <td className="py-3 text-sm text-foreground">{stat.month}</td>
                  <td className="py-3 text-sm text-foreground">{stat.uploads}</td>
                  <td className="py-3 text-sm text-foreground">{stat.downloads}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">+{Math.floor(Math.random() * 20)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
