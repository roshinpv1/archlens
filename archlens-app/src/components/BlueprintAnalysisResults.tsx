"use client";

import { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Component, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Star,
  Zap
} from 'lucide-react';

interface ComponentAnalysis {
  name: string;
  type: string;
  technology: string;
  criticality: 'high' | 'medium' | 'low';
  dependencies: string[];
  scalability: 'horizontal' | 'vertical' | 'both';
  securityLevel: 'high' | 'medium' | 'low';
  costImpact: 'high' | 'medium' | 'low';
  performanceCharacteristics: {
    latency: 'low' | 'medium' | 'high';
    throughput: 'low' | 'medium' | 'high';
    availability: number;
  };
  description?: string;
  responsibilities?: string[];
}

interface ComponentRelationship {
  source: string;
  target: string;
  relationship: 'depends_on' | 'communicates_with' | 'scales_with' | 'integrates_with';
  strength?: number;
}

interface Recommendation {
  component?: string;
  issue: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  confidence?: number;
}

interface BlueprintAnalysisResultsProps {
  analysis: {
    blueprintId: string;
    analysisId: string;
    components: ComponentAnalysis[];
    componentRelationships: ComponentRelationship[];
    architecturePatterns: string[];
    technologyStack: string[];
    componentComplexity: {
      totalComponents: number;
      criticalComponents: number;
      highCouplingComponents: number;
      scalabilityBottlenecks: string[];
      integrationPoints: number;
    };
    scores: {
      security: number;
      resiliency: number;
      costEfficiency: number;
      compliance: number;
      scalability: number;
      maintainability: number;
    };
    recommendations: Recommendation[];
    insights: string[];
    bestPractices: string[];
    industryStandards: string[];
    createdAt: string;
    updatedAt: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function BlueprintAnalysisResults({ analysis, isOpen, onClose }: BlueprintAnalysisResultsProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'recommendations' | 'insights'>('overview');

  const toggleComponent = (componentName: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentName)) {
      newExpanded.delete(componentName);
    } else {
      newExpanded.add(componentName);
    }
    setExpandedComponents(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

         // Safety check for analysis data
         if (!analysis || !analysis.scores) {
           console.error('❌ Analysis data missing or corrupted:', {
             analysis: analysis,
             hasAnalysis: !!analysis,
             hasScores: !!(analysis && analysis.scores),
             analysisKeys: analysis ? Object.keys(analysis) : 'null'
           });
           return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
                 <div className="text-red-500 mb-4">⚠️</div>
                 <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Data Missing</h2>
                 <p className="text-gray-600 mb-4">The analysis data is incomplete or corrupted.</p>
                 <div className="text-xs text-gray-500 mb-4">
                   Debug: {analysis ? `Keys: ${Object.keys(analysis).join(', ')}` : 'No analysis object'}
                 </div>
                 <button
                   onClick={onClose}
                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                 >
                   Close
                 </button>
               </div>
             </div>
           );
         }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blueprint Analysis</h2>
              <p className="text-gray-600">Component-focused architecture analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'components', label: 'Components', icon: Component },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'insights', label: 'Insights', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Security', score: analysis.scores?.security || 0, icon: Shield },
                  { label: 'Resiliency', score: analysis.scores?.resiliency || 0, icon: CheckCircle },
                  { label: 'Cost Efficiency', score: analysis.scores?.costEfficiency || 0, icon: DollarSign },
                  { label: 'Compliance', score: analysis.scores?.compliance || 0, icon: CheckCircle },
                  { label: 'Scalability', score: analysis.scores?.scalability || 0, icon: TrendingUp },
                  { label: 'Maintainability', score: analysis.scores?.maintainability || 0, icon: Zap }
                ].map(({ label, score, icon: Icon }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                      {score}/100
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture Patterns */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Architecture Patterns</h3>
                <div className="flex flex-wrap gap-2">
                  {(analysis.architecturePatterns || []).map((pattern, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(analysis.technologyStack || []).map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Complexity Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{analysis.componentComplexity?.totalComponents || 0}</div>
                  <div className="text-sm text-gray-600">Total Components</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{analysis.componentComplexity?.criticalComponents || 0}</div>
                  <div className="text-sm text-gray-600">Critical Components</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{analysis.componentComplexity?.integrationPoints || 0}</div>
                  <div className="text-sm text-gray-600">Integration Points</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{analysis.componentComplexity?.highCouplingComponents || 0}</div>
                  <div className="text-sm text-gray-600">High Coupling</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Analysis</h3>
              {(analysis.components || []).map((component, index) => {
                const isExpanded = expandedComponents.has(component.name);
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleComponent(component.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Component className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{component.name}</h4>
                            <p className="text-sm text-gray-600">{component.type} • {component.technology}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(component.criticality)}`}>
                            {component.criticality}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Scalability</label>
                              <p className="text-sm text-gray-900 capitalize">{component.scalability}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Security Level</label>
                              <p className="text-sm text-gray-900 capitalize">{component.securityLevel}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Cost Impact</label>
                              <p className="text-sm text-gray-900 capitalize">{component.costImpact}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Availability</label>
                              <p className="text-sm text-gray-900">{component.performanceCharacteristics.availability}%</p>
                            </div>
                          </div>
                          
                          {component.dependencies.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Dependencies</label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {component.dependencies.map((dep, depIndex) => (
                                  <span key={depIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {component.description && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Description</label>
                              <p className="text-sm text-gray-900 mt-1">{component.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              {(analysis.recommendations || []).length > 0 ? (
                (analysis.recommendations || []).map((rec, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">{rec.component}</h4>
                        <p className="text-sm text-yellow-800 mt-1">{rec.issue}</p>
                        <p className="text-sm text-yellow-700 mt-2">{rec.recommendation}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {Math.round(rec.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recommendations available
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="space-y-2">
                  {(analysis.insights || []).map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
                <div className="space-y-2">
                  {(analysis.bestPractices || []).map((practice, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-900">{practice}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Standards</h3>
                <div className="space-y-2">
                  {(analysis.industryStandards || []).map((standard, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                      <Star className="w-4 h-4 text-purple-600 mt-0.5" />
                      <p className="text-sm text-purple-900">{standard}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
