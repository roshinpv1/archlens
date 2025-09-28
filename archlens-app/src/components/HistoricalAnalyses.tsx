"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Calendar, Shield, TrendingUp, DollarSign, Target, Search, Filter, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import { IAnalysis } from "@/models/Analysis";

interface AnalysesResponse {
  analyses: IAnalysis[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface HistoricalAnalysesProps {
  onViewAnalysis: (analysis: IAnalysis) => void;
}

export function HistoricalAnalyses({ onViewAnalysis }: HistoricalAnalysesProps) {
  const [data, setData] = useState<AnalysesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('appId', searchTerm);
      if (environmentFilter) params.append('environment', environmentFilter);
      
      const response = await fetch(`/api/analyses?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, environmentFilter]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }
      
      // Refresh the list
      fetchAnalyses();
    } catch (err) {
      alert('Failed to delete analysis: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getEnvironmentBadge = (environment: string) => {
    const colors = {
      production: 'bg-error-light text-error',
      staging: 'bg-warning-light text-warning',
      development: 'bg-info-light text-info',
      testing: 'bg-info-light text-info',
      sandbox: 'bg-secondary text-secondary-foreground'
    };
    
    return colors[environment as keyof typeof colors] || 'bg-muted text-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/6"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-6 text-center">
        <FileText className="w-8 h-8 text-error mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-error mb-2">Failed to Load Analyses</h3>
        <p className="text-error/80 mb-4">{error}</p>
        <button
          onClick={fetchAnalyses}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Analyses</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search by App ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search app ID..."
                    className="input-base pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Environment
                </label>
                <select
                  value={environmentFilter}
                  onChange={(e) => setEnvironmentFilter(e.target.value)}
                  className="input-base"
                >
                  <option value="">All environments</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis List */}
      {!data || data.analyses.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Analyses Found</h3>
          <p className="text-foreground-muted">
            {searchTerm || environmentFilter 
              ? "No analyses match your current filters" 
              : "Start your first architecture analysis to see results here"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.analyses.map((analysis) => (
            <div
              key={analysis._id}
              className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {analysis.appId} - {analysis.componentName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentBadge(analysis.environment || 'unknown')}`}>
                      {analysis.environment?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{analysis.fileName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
                    </div>
                    {analysis.version && (
                      <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        v{analysis.version}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewAnalysis(analysis)}
                    className="p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    title="View analysis"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnalysis(analysis._id)}
                    className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                    title="Delete analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted">Security</div>
                    <div className={`font-semibold ${getScoreColor(analysis.securityScore)}`}>
                      {analysis.securityScore}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-info-light rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted">Resilience</div>
                    <div className={`font-semibold ${getScoreColor(analysis.resiliencyScore)}`}>
                      {analysis.resiliencyScore}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted">Cost</div>
                    <div className={`font-semibold ${getScoreColor(analysis.costEfficiencyScore)}`}>
                      {analysis.costEfficiencyScore}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted">Compliance</div>
                    <div className={`font-semibold ${getScoreColor(analysis.complianceScore)}`}>
                      {analysis.complianceScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {analysis.description && (
                <div className="bg-muted/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-foreground-muted italic">{analysis.description}</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-sm text-foreground-muted border-t border-border pt-4">
                <div className="flex items-center space-x-4">
                  <span>{analysis.components?.length || 0} components</span>
                  <span>{analysis.risks?.length || 0} risks</span>
                  <span>{analysis.recommendations?.length || 0} recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Processed by</span>
                  <span className="font-medium">{analysis.llmProvider?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-foreground-muted">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of{' '}
            {data.pagination.totalCount} analyses
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!data.pagination.hasPrevPage}
              className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-4 py-2 text-sm font-medium">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!data.pagination.hasNextPage}
              className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
