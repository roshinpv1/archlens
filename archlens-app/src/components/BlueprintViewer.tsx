"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Star, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  Image, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Brain,
  Search,
  Loader2,
  Shield,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Wrench,
  Network,
  Server,
  Database,
  MessageSquare
} from 'lucide-react';
import { Blueprint, BlueprintType, BlueprintCategory, BlueprintComplexity } from '@/types/blueprint';
import { formatDate } from '@/utils/dateUtils';

interface BlueprintViewerProps {
  blueprint: Blueprint;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (blueprint: Blueprint) => void;
  onDelete?: (blueprint: Blueprint) => void;
  onDownload?: (blueprint: Blueprint) => void;
  onRate?: (blueprint: Blueprint, rating: number) => void;
  onAnalyze?: (blueprint: Blueprint) => void;
}

export function BlueprintViewer({ 
  blueprint, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onDownload, 
  onRate,
  onAnalyze
}: BlueprintViewerProps) {
  const [currentRating, setCurrentRating] = useState(blueprint.rating);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'analysis' | 'search' | 'preview' | 'versions'>('details');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searching, setSearching] = useState(false);

  // Fetch analysis when component opens
  useEffect(() => {
    if (isOpen && blueprint.hasAnalysis && blueprint.lastAnalysisId) {
      fetchAnalysis();
    }
  }, [isOpen, blueprint.id]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await fetch(`/api/blueprints/${blueprint.id}/analyze`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchAnswer('');
    try {
      const response = await fetch(`/api/blueprints/${blueprint.id}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchAnswer(data.answer);
      } else {
        setSearchAnswer('Failed to process query. Please try again.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchAnswer('An error occurred while processing your query.');
    } finally {
      setSearching(false);
    }
  };

  const getFileIcon = (type: BlueprintType) => {
    switch (type) {
      case BlueprintType.ARCHITECTURE:
        return <Image className="w-6 h-6" />;
      case BlueprintType.IAC:
        return <FileText className="w-6 h-6" />;
      case BlueprintType.TEMPLATE:
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getComplexityColor = (complexity: BlueprintComplexity) => {
    switch (complexity) {
      case BlueprintComplexity.LOW:
        return 'bg-green-100 text-green-800';
      case BlueprintComplexity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case BlueprintComplexity.HIGH:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRating = (rating: number) => {
    setCurrentRating(rating);
    onRate?.(blueprint, rating);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileIcon(blueprint.type)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-foreground truncate" title={blueprint.name}>{blueprint.name}</h2>
              <p className="text-sm text-foreground-muted">v{blueprint.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(blueprint)}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(blueprint)}
                className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Details
          </button>
          {blueprint.hasAnalysis && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analysis'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Analysis
            </button>
          )}
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'search'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              AI Search
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'preview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'versions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Versions
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Type:</span>
                      <span className="text-sm text-foreground capitalize">{blueprint.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Category:</span>
                      <span className="text-sm text-foreground">{blueprint.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Complexity:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(blueprint.complexity)}`}>
                        {blueprint.complexity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Visibility:</span>
                      <div className="flex items-center gap-1">
                        {blueprint.isPublic ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                        <span className="text-sm text-foreground">{blueprint.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">File Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">File:</span>
                      <span className="text-sm text-foreground">{blueprint.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Size:</span>
                      <span className="text-sm text-foreground">{formatFileSize(blueprint.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Type:</span>
                      <span className="text-sm text-foreground">{blueprint.fileType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">Version:</span>
                      <span className="text-sm text-foreground">v{blueprint.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Description</h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className={`text-foreground ${!showFullDescription && 'line-clamp-3'}`}>
                    {blueprint.description}
                  </p>
                  {blueprint.description.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary hover:text-primary-hover text-sm font-medium mt-2"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {blueprint.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud Providers */}
              {blueprint.cloudProviders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Cloud Providers</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.cloudProviders.map(provider => (
                      <span key={provider} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {provider}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {blueprint.metadata && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blueprint.metadata.components && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Components</div>
                        <div className="text-2xl font-bold text-foreground">{blueprint.metadata.components}</div>
                      </div>
                    )}
                    {blueprint.metadata.connections && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Connections</div>
                        <div className="text-2xl font-bold text-foreground">{blueprint.metadata.connections}</div>
                      </div>
                    )}
                    {blueprint.metadata.estimatedCost && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Estimated Cost</div>
                        <div className="text-2xl font-bold text-foreground">${blueprint.metadata.estimatedCost}/month</div>
                      </div>
                    )}
                    {blueprint.metadata.deploymentTime && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Deployment Time</div>
                        <div className="text-2xl font-bold text-foreground">{blueprint.metadata.deploymentTime}</div>
                      </div>
                    )}
                    {blueprint.metadata.architectureType && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Architecture Type</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.architectureType}</div>
                      </div>
                    )}
                    {blueprint.metadata.primaryCloudProvider && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-foreground-muted">Primary Cloud Provider</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.primaryCloudProvider}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Components */}
              {blueprint.metadata?.extractedComponents && blueprint.metadata.extractedComponents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Extracted Components ({blueprint.metadata.extractedComponents.length})
                  </h3>
                  
                  {/* Group components by Terraform category */}
                  {(() => {
                    const componentsByCategory = blueprint.metadata.extractedComponents.reduce((acc: Record<string, any[]>, comp: any) => {
                      const category = comp.terraformCategory || 'Uncategorized';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(comp);
                      return acc;
                    }, {});

                    return (
                      <div className="space-y-4">
                        {Object.entries(componentsByCategory).map(([category, components]) => (
                          <div key={category} className="bg-muted rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              {category} ({components.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {components.map((comp: any, idx: number) => (
                                <div key={idx} className="bg-surface rounded-lg p-3 border border-border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-foreground">{comp.name || comp.id || `Component ${idx + 1}`}</div>
                                      <div className="text-sm text-foreground-muted mt-1">
                                        Type: <span className="capitalize">{comp.type || 'unknown'}</span>
                                        {comp.cloudProvider && ` • Provider: ${comp.cloudProvider}`}
                                        {comp.cloudService && ` • Service: ${comp.cloudService}`}
                                      </div>
                                      {comp.description && (
                                        <div className="text-sm text-foreground-muted mt-1">{comp.description}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Extracted Connections */}
              {blueprint.metadata?.extractedConnections && blueprint.metadata.extractedConnections.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Extracted Connections ({blueprint.metadata.extractedConnections.length})
                  </h3>
                  <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {blueprint.metadata.extractedConnections.map((conn: any, idx: number) => (
                        <div key={idx} className="bg-surface rounded-lg p-3 border border-border">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">{conn.source || 'Unknown'}</span>
                            <span className="text-foreground-muted">→</span>
                            <span className="font-medium text-foreground">{conn.target || 'Unknown'}</span>
                            {conn.type && (
                              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                {conn.type}
                              </span>
                            )}
                            {conn.protocol && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {conn.protocol}
                              </span>
                            )}
                          </div>
                          {conn.description && (
                            <div className="text-sm text-foreground-muted mt-1">{conn.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Rating</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="p-1"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            star <= currentRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-foreground-muted">
                    {currentRating.toFixed(1)} ({blueprint.downloadCount} downloads)
                  </span>
                </div>
              </div>

              {/* Author & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Author</h3>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-foreground-muted" />
                    <span className="text-sm text-foreground">{blueprint.createdBy}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Dates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Created:</span>
                      <span className="text-sm text-foreground">{formatDate(blueprint.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Updated:</span>
                      <span className="text-sm text-foreground">{formatDate(blueprint.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-foreground-muted">Loading analysis...</span>
                </div>
              ) : analysis ? (
                <>
                  {/* Analysis Scores */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Security', score: analysis.scores?.security || 0, icon: Shield },
                        { label: 'Resiliency', score: analysis.scores?.resiliency || 0, icon: CheckCircle },
                        { label: 'Cost Efficiency', score: analysis.scores?.costEfficiency || 0, icon: DollarSign },
                        { label: 'Compliance', score: analysis.scores?.compliance || 0, icon: CheckCircle },
                        { label: 'Scalability', score: analysis.scores?.scalability || 0, icon: TrendingUp },
                        { label: 'Maintainability', score: analysis.scores?.maintainability || 0, icon: Wrench }
                      ].map(({ label, score, icon: Icon }) => (
                        <div key={label} className="bg-muted rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-foreground-muted" />
                            <span className="text-sm text-foreground-muted">{label}</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground">{score}/100</div>
                          <div className="w-full bg-surface rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Patterns & Technology Stack */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.architecturePatterns && analysis.architecturePatterns.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Architecture Patterns</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.architecturePatterns.map((pattern: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.technologyStack && analysis.technologyStack.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Technology Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.technologyStack.map((tech: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Component Complexity */}
                  {analysis.componentComplexity && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Component Complexity</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-foreground-muted">Total Components</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.totalComponents || 0}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-foreground-muted">Critical Components</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.criticalComponents || 0}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-foreground-muted">High Coupling</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.highCouplingComponents || 0}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-foreground-muted">Integration Points</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.integrationPoints || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analyzed Components */}
                  {analysis.components && analysis.components.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        Analyzed Components ({analysis.components.length})
                      </h3>
                      
                      {/* Group components by Terraform category */}
                      {(() => {
                        const componentsByCategory = analysis.components.reduce((acc: Record<string, any[]>, comp: any) => {
                          const category = comp.terraformCategory || 'Uncategorized';
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(comp);
                          return acc;
                        }, {});

                        return (
                          <div className="space-y-4">
                            {Object.entries(componentsByCategory).map(([category, comps]) => {
                              const components = comps as any[];
                              return (
                              <div key={category} className="bg-muted rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Tag className="w-4 h-4" />
                                  {category} ({components.length})
                                </h4>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {components.map((comp: any, idx: number) => (
                                    <div key={idx} className="bg-surface rounded-lg p-4 border border-border">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="font-medium text-foreground">{comp.name}</div>
                                          <div className="text-sm text-foreground-muted mt-1">
                                            Type: <span className="capitalize">{comp.type}</span> • Technology: {comp.technology}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <span className={`px-2 py-1 rounded text-xs ${comp.criticality === 'high' ? 'bg-red-100 text-red-800' : comp.criticality === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {comp.criticality}
                                          </span>
                                        </div>
                                      </div>
                                      {comp.description && (
                                        <div className="text-sm text-foreground-muted mt-2">{comp.description}</div>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-xs text-foreground-muted">Scalability: {comp.scalability}</span>
                                        <span className="text-xs text-foreground-muted">Security: {comp.securityLevel}</span>
                                        <span className="text-xs text-foreground-muted">Cost: {comp.costImpact}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {analysis.recommendations.map((rec: any, idx: number) => (
                          <div key={idx} className="bg-muted rounded-lg p-4 border-l-4 border-primary">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{rec.component || 'General'}</div>
                                <div className="text-sm text-foreground-muted mt-1">{rec.issue}</div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {rec.priority}
                              </span>
                            </div>
                            <div className="text-sm text-foreground mt-2">{rec.recommendation}</div>
                            <div className="flex gap-4 mt-2 text-xs text-foreground-muted">
                              <span>Impact: {rec.impact}</span>
                              <span>Effort: {rec.effort}</span>
                              <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
                      <div className="space-y-2">
                        {analysis.insights.map((insight: string, idx: number) => (
                          <div key={idx} className="bg-muted rounded-lg p-4 flex items-start gap-3">
                            <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-foreground">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">No analysis available for this blueprint.</p>
                  {onAnalyze && (
                    <button
                      onClick={() => onAnalyze(blueprint)}
                      className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
                    >
                      Run Analysis
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Powered Blueprint Search
                </h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Ask questions about this blueprint and get intelligent answers based on its components, analysis, and metadata.
                </p>
                
                {/* Search Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g., What are the security recommendations? What components are critical? What is the architecture pattern?"
                    className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Search
                      </>
                    )}
                  </button>
                </div>

                {/* Search Results */}
                {searchAnswer && (
                  <div className="bg-muted rounded-lg p-6 border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Answer</h4>
                        <div className="text-foreground whitespace-pre-wrap">{searchAnswer}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Example Questions */}
                {!searchAnswer && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Example Questions:</h4>
                    <div className="space-y-2">
                      {[
                        "What are the security recommendations for this blueprint?",
                        "Which components are critical and why?",
                        "What architecture patterns are used?",
                        "What is the scalability score and what are the bottlenecks?",
                        "What technologies are used in this blueprint?",
                        "What are the cost optimization recommendations?"
                      ].map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(question);
                            handleSearch();
                          }}
                          className="w-full text-left px-3 py-2 bg-surface hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-4">File Preview</h3>
                <div className="bg-muted rounded-lg p-8">
                  {blueprint.fileType.startsWith('image/') ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <Image className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-foreground-muted">Image preview would be displayed here</p>
                      <p className="text-sm text-foreground-muted">
                        File: {blueprint.fileName} ({formatFileSize(blueprint.fileSize)})
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-foreground-muted">File content preview would be displayed here</p>
                      <p className="text-sm text-foreground-muted">
                        File: {blueprint.fileName} ({formatFileSize(blueprint.fileSize)})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Version History</h3>
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">v{blueprint.version}</div>
                        <div className="text-sm text-foreground-muted">Current version</div>
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {formatDate(blueprint.updatedAt)}
                      </div>
                    </div>
                  </div>
                  {/* Additional versions would be listed here */}
                  <div className="text-center py-8">
                    <p className="text-foreground-muted">No previous versions available</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-foreground-muted" />
              <span className="text-sm text-foreground-muted">{blueprint.downloadCount} downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-foreground-muted">{blueprint.rating.toFixed(1)} rating</span>
            </div>
          </div>
          <div className="flex gap-2">
            {onAnalyze && (
              <button
                onClick={() => onAnalyze(blueprint)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4" />
                Analyze
              </button>
            )}
            <button
              onClick={() => onDownload?.(blueprint)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
