"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HistoricalAnalyses } from '@/components/HistoricalAnalyses';
import { EvaluationModal } from '@/components/EvaluationModal';
import { Plus, Search, Filter, Download } from 'lucide-react';

interface Analysis {
  _id: string;
  timestamp: string;
  fileName: string;
  fileType: string;
  appId?: string;
  componentName?: string;
  description?: string;
  environment?: string;
  version?: string;
  summary: string;
  resiliencyScore: number;
  securityScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
  llmProvider: string;
  llmModel: string;
  status: string;
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterEnvironment && { environment: filterEnvironment })
      });

      const response = await fetch(`/api/analyses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [currentPage, searchTerm, filterEnvironment]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (environment: string) => {
    setFilterEnvironment(environment);
    setCurrentPage(1);
  };

  const exportAnalyses = () => {
    const csvContent = [
      ['Timestamp', 'File Name', 'App ID', 'Component', 'Environment', 'Security Score', 'Cost Score', 'Compliance Score', 'Summary'],
      ...analyses.map(analysis => [
        new Date(analysis.timestamp).toLocaleDateString(),
        analysis.fileName,
        analysis.appId || '',
        analysis.componentName || '',
        analysis.environment || '',
        analysis.securityScore.toString(),
        analysis.costEfficiencyScore.toString(),
        analysis.complianceScore.toString(),
        analysis.summary.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudarch-analyses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    // For now, we'll just log it. In a real app, you might navigate to a detail page
    console.log('Viewing analysis:', analysis);
    // You could also navigate to a detail page: router.push(`/analyses/${analysis._id}`)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Architecture Analyses</h1>
            <p className="text-foreground-muted">
              View and manage all your cloud architecture evaluations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportAnalyses}
              disabled={analyses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            <button
              onClick={() => setShowNewAnalysisModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by App ID, Component Name, or File Name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
            <select
              value={filterEnvironment}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-[150px]"
            >
              <option value="">All Environments</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        {/* Analyses List */}
        <div className="bg-surface border border-border rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground-muted">Loading analyses...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No analyses found</h3>
              <p className="text-foreground-muted mb-4">
                {searchTerm || filterEnvironment 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first architecture analysis.'
                }
              </p>
              {!searchTerm && !filterEnvironment && (
                <button
                  onClick={() => setShowNewAnalysisModal(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
                >
                  Create First Analysis
                </button>
              )}
            </div>
          ) : (
            <HistoricalAnalyses 
              analyses={analyses}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onRefresh={fetchAnalyses}
              onViewAnalysis={handleViewAnalysis}
            />
          )}
        </div>
      </main>

      {/* New Analysis Modal */}
      {showNewAnalysisModal && (
        <EvaluationModal
          isOpen={showNewAnalysisModal}
          onClose={() => setShowNewAnalysisModal(false)}
          onAnalysisComplete={() => {
            setShowNewAnalysisModal(false);
            fetchAnalyses(); // Refresh the analyses list
          }}
        />
      )}
    </div>
  );
}
