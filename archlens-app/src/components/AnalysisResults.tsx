"use client";

import { useState } from "react";
import { 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  CheckCircle,
  FileText,
  BarChart3,
  Target,
  TrendingUp
} from "lucide-react";
import { ArchitectureAnalysis, RiskLevel } from "@/types/architecture";

interface AnalysisResultsProps {
  results: ArchitectureAnalysis;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ results, onNewAnalysis }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'risks' | 'recommendations' | 'json'>('overview');

  const downloadJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-analysis-${results.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRiskLevelColor = (level: RiskLevel | string) => {
    const levelStr = typeof level === 'string' ? level.toLowerCase() : level;
    switch (levelStr) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'components', label: 'Components', icon: Target },
    { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'json', label: 'JSON Export', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Analysis Results</h2>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-foreground-muted">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="font-medium">{results.fileName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(results.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Processed with {(results.llmProvider || 'unknown').toString().toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            {/* Application Metadata */}
            {(results.appId || results.componentName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                {results.appId && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">App ID</div>
                    <div className="text-sm font-semibold text-foreground">{results.appId}</div>
                  </div>
                )}
                {results.componentName && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Component</div>
                    <div className="text-sm font-semibold text-foreground">{results.componentName}</div>
                  </div>
                )}
                {results.environment && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Environment</div>
                    <div className="text-sm font-semibold text-foreground">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        results.environment === 'production' ? 'bg-error-light text-error' :
                        results.environment === 'staging' ? 'bg-warning-light text-warning' :
                        'bg-info-light text-info'
                      }`}>
                        {(results.environment || 'unknown').toString().charAt(0).toUpperCase() + (results.environment || 'unknown').toString().slice(1)}
                      </span>
                    </div>
                  </div>
                )}
                {results.version && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Version</div>
                    <div className="text-sm font-semibold text-foreground font-mono">{results.version}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Processing Time</div>
                  <div className="text-sm font-semibold text-foreground">{results.processingTime}ms</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={downloadJSON}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary hover:border-border-hover transition-all duration-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={onNewAnalysis}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Security</span>
              <div className="text-xs text-foreground-muted">Vulnerability Assessment</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.securityScore)}`}>
              {results.securityScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.securityScore >= 80 ? 'bg-success' :
                results.securityScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.securityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-info" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Resiliency</span>
              <div className="text-xs text-foreground-muted">Fault Tolerance</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.resiliencyScore)}`}>
              {results.resiliencyScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.resiliencyScore >= 80 ? 'bg-success' :
                results.resiliencyScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.resiliencyScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Cost Efficiency</span>
              <div className="text-xs text-foreground-muted">Resource Optimization</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.costEfficiencyScore)}`}>
              {results.costEfficiencyScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.costEfficiencyScore >= 80 ? 'bg-success' :
                results.costEfficiencyScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.costEfficiencyScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Compliance</span>
              <div className="text-xs text-foreground-muted">Regulatory Standards</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.complianceScore)}`}>
              {results.complianceScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.complianceScore >= 80 ? 'bg-success' :
                results.complianceScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.complianceScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'components' | 'risks' | 'recommendations' | 'json')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Architecture Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                {results.summary}
              </p>
            </div>
            
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Architecture Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {results.architectureDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Key Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components Found:</span>
                    <span className="font-medium text-foreground">{results.components.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections:</span>
                    <span className="font-medium text-foreground">{results.connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risks Identified:</span>
                    <span className="font-medium text-foreground">{results.risks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommendations:</span>
                    <span className="font-medium text-foreground">{results.recommendations.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Potential Savings</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${results.estimatedSavingsUSD}
                  </div>
                  <p className="text-muted-foreground">Estimated monthly savings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.components.map((component) => (
                <div key={component.id} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{component.name}</h4>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {component.type}
                    </span>
                  </div>
                  {component.cloudService && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {component.cloudService}
                    </p>
                  )}
                  {component.description && (
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            {results.risks && Array.isArray(results.risks) ? (
              results.risks.map((risk) => (
                <div key={risk.id || `risk-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{risk.title || 'Unknown Risk'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(risk.level || 'medium')}`}>
                      {(risk.level || 'medium').toString().toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{risk.description || 'No description available'}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-foreground">Recommendations:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {risk.recommendations && Array.isArray(risk.recommendations) ? (
                        risk.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {typeof rec === 'string' ? rec : rec.toString()}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No recommendations available</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No risks identified
              </div>
            )}

            {results.complianceGaps && Array.isArray(results.complianceGaps) && results.complianceGaps.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Gaps</h3>
                <div className="space-y-4">
                  {results.complianceGaps.map((gap) => (
                    <div key={gap.id || `gap-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{gap.requirement || 'Unknown Requirement'}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(gap.severity || 'medium')}`}>
                          {(gap.severity || 'medium').toString().toUpperCase()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{gap.description || 'No description available'}</p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-foreground">Remediation:</h5>
                        <p className="text-sm text-muted-foreground">{gap.remediation || 'No remediation provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {results.recommendations && Array.isArray(results.recommendations) ? (
              results.recommendations.map((rec) => (
                <div key={rec.id || `rec-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{rec.issue || 'Unknown Issue'}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(rec.impact || 'medium')}`}>
                        {(rec.impact || 'medium').toString().toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                        {rec.effort || 'medium'} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{rec.fix || 'No fix provided'}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Priority: {rec.priority || 1}</span>
                    <span>Category: {rec.category || 'security'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recommendations available
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">JSON Export</h3>
              <button
                onClick={downloadJSON}
                className="flex items-center space-x-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm text-foreground">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
