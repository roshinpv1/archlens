"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { EvaluationModal } from "@/components/EvaluationModal";
import { AnalysisResults } from "@/components/AnalysisResults";
import { DashboardStats } from "@/components/DashboardStats";
import { HistoricalAnalyses } from "@/components/HistoricalAnalyses";
import { ArchitectureAnalysis, AnalysisProgress, RiskLevel } from "@/types/architecture";
import { IAnalysis } from "@/models/Analysis";
import { Plus, BarChart3, History, TrendingUp } from "lucide-react";

type ViewMode = 'dashboard' | 'analysis';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [analysisResults, setAnalysisResults] = useState<ArchitectureAnalysis | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  const handleAnalysisComplete = (results: unknown) => {
    console.log('Analysis results received:', results);
    
    // Validate and sanitize the results
    const sanitizedResults = results as ArchitectureAnalysis;
    
    // Ensure recommendations is an array of objects with proper structure
    if (sanitizedResults.recommendations && Array.isArray(sanitizedResults.recommendations)) {
      sanitizedResults.recommendations = (sanitizedResults.recommendations as unknown as Record<string, unknown>[]).map((rec: Record<string, unknown>) => ({
        id: (rec.id as string) || `rec-${Date.now()}-${Math.random()}`,
        issue: (rec.issue as string) || (rec.title as string) || 'Unknown issue',
        fix: (rec.fix as string) || (rec.description as string) || 'No fix provided',
        impact: (rec.impact as RiskLevel) || RiskLevel.MEDIUM,
        effort: (rec.effort as 'low' | 'medium' | 'high') || 'medium',
        priority: typeof rec.priority === 'number' ? rec.priority : parseInt(rec.priority as string) || 1,
        category: (rec.category as 'security' | 'reliability' | 'performance' | 'cost' | 'compliance') || 'security'
      }));
    }
    
    // Ensure other arrays are properly structured
    if (!Array.isArray(sanitizedResults.components)) {
      sanitizedResults.components = [];
    }
    if (!Array.isArray(sanitizedResults.connections)) {
      sanitizedResults.connections = [];
    }
    if (!Array.isArray(sanitizedResults.risks)) {
      sanitizedResults.risks = [];
    }
    if (!Array.isArray(sanitizedResults.complianceGaps)) {
      sanitizedResults.complianceGaps = [];
    }
    if (!Array.isArray(sanitizedResults.costIssues)) {
      sanitizedResults.costIssues = [];
    }
    
    console.log('Sanitized results:', sanitizedResults);
    setAnalysisResults(sanitizedResults);
    setProgress(null);
    setViewMode('analysis');
  };

  const handleAnalysisStart = (progress: AnalysisProgress) => {
    setProgress(progress);
    setAnalysisResults(null);
  };

  const handleViewAnalysis = (analysis: IAnalysis) => {
    // Convert IAnalysis to ArchitectureAnalysis format
    const architectureAnalysis = {
      ...analysis,
      id: analysis._id,
      timestamp: new Date(analysis.timestamp)
    } as unknown as ArchitectureAnalysis;
    
    setAnalysisResults(architectureAnalysis);
    setViewMode('analysis');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setAnalysisResults(null);
    setProgress(null);
  };

  if (progress && progress.stage !== "complete" && progress.stage !== "error") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface border border-border rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {progress.message}
              </h3>
              <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-active h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-foreground-muted">
                <span className="font-medium">{progress.progress}% complete</span>
                <span>•</span>
                <span>Processing your architecture...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (progress && progress.stage === "error") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-error-light border border-error/20 rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-error mb-3">
                Analysis Failed
              </h3>
              <p className="text-error/80 mb-6 max-w-md mx-auto">
                {progress.error || "An unexpected error occurred during the analysis. Please try again or contact support if the issue persists."}
              </p>
              <button
                onClick={handleBackToDashboard}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'dashboard' ? (
            <>
              {/* Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    CloudArc Dashboard
                  </h1>
                  <p className="text-lg text-foreground-muted mt-1">
                    Enterprise cloud architecture analysis and monitoring
                  </p>
                </div>
                
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Evaluation</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1 bg-muted rounded-xl p-1 mb-8 w-fit">
                <button className="flex items-center space-x-2 px-4 py-2 bg-surface text-foreground rounded-lg shadow-sm font-medium">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-surface/50 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-surface/50 rounded-lg transition-colors">
                  <History className="w-4 h-4" />
                  <span>Reports</span>
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-8">
                {/* Statistics Section */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-6">System Overview</h2>
                  <DashboardStats />
                </section>

                {/* Historical Analyses Section */}
                <section>
                  <HistoricalAnalyses onViewAnalysis={handleViewAnalysis} />
                </section>
              </div>
            </>
          ) : (
            <AnalysisResults 
              results={analysisResults!}
              onNewAnalysis={handleBackToDashboard}
            />
          )}
        </div>
      </main>

      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        onAnalysisStart={handleAnalysisStart}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </div>
  );
}