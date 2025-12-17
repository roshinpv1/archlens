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
  MessageSquare,
  AlertTriangle,
  Target,
  Save,
  X as XIcon,
  Plus,
  Code
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
  onUpdate?: (blueprint: Blueprint) => void; // Callback when blueprint is updated
  asPage?: boolean; // If true, render as page content instead of modal
}

export function BlueprintViewer({ 
  blueprint: initialBlueprint, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onDownload, 
  onRate,
  onAnalyze,
  onUpdate,
  asPage = false
}: BlueprintViewerProps) {
  const [blueprint, setBlueprint] = useState<Blueprint>(initialBlueprint);
  const [currentRating, setCurrentRating] = useState(initialBlueprint.rating);
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'analysis' | 'risks' | 'recommendations' | 'search' | 'json'>('overview');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searching, setSearching] = useState(false);

  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch full blueprint data when viewer opens (to get originalFile)
  const fetchFullBlueprint = async () => {
    try {
      const response = await fetch(`/api/blueprints/${initialBlueprint.id}`);
      if (response.ok) {
        const fullBlueprint = await response.json();
        setBlueprint(fullBlueprint);
        setCurrentRating(fullBlueprint.rating);
      }
    } catch (error) {
      console.error('Failed to fetch full blueprint:', error);
      // Fallback to initial blueprint
      setBlueprint(initialBlueprint);
      setCurrentRating(initialBlueprint.rating);
    }
  };

  // Update blueprint when prop changes or when viewer opens
  useEffect(() => {
    if (isOpen) {
      // Fetch full blueprint data when viewer opens to get originalFile
      fetchFullBlueprint();
    } else {
      setBlueprint(initialBlueprint);
      setCurrentRating(initialBlueprint.rating);
    }
  }, [initialBlueprint, isOpen]);

  // Fetch analysis when component opens
  useEffect(() => {
    if (isOpen) {
      // Always try to fetch analysis when viewer opens
      console.log(`📋 Blueprint viewer opened for: ${blueprint.id}`, {
        hasAnalysis: blueprint.hasAnalysis,
        lastAnalysisId: blueprint.lastAnalysisId
      });
      fetchAnalysis();
    } else {
      // Reset analysis when viewer closes
      setAnalysis(null);
    }
  }, [isOpen, blueprint.id]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      console.log(`🔍 Fetching analysis for blueprint ${blueprint.id}...`);
      const response = await fetch(`/api/blueprints/${blueprint.id}/analyze`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched blueprint analysis response:', {
          success: data.success,
          hasAnalysis: !!data.analysis,
          analysisKeys: data.analysis ? Object.keys(data.analysis) : [],
          risks: data.analysis?.risks?.length || 0,
          complianceGaps: data.analysis?.complianceGaps?.length || 0,
          costIssues: data.analysis?.costIssues?.length || 0,
          recommendations: data.analysis?.recommendations?.length || 0,
          components: data.analysis?.components?.length || 0,
          fullAnalysis: data.analysis // Log full analysis for debugging
        });
        if (data.analysis) {
          // Always set analysis if it exists, regardless of success flag
          console.log('✅ Setting analysis state with data:', {
            risksCount: data.analysis.risks?.length || 0,
            complianceGapsCount: data.analysis.complianceGaps?.length || 0,
            costIssuesCount: data.analysis.costIssues?.length || 0,
            recommendationsCount: data.analysis.recommendations?.length || 0
          });
          setAnalysis(data.analysis);
        } else {
          console.warn('⚠️ No analysis data in response:', data);
          setAnalysis(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch analysis:', response.status, errorData);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch analysis:', error);
      setAnalysis(null);
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
        console.log('📊 Blueprint search response:', {
          hasAnswer: !!data.answer,
          answerType: typeof data.answer,
          answerPreview: data.answer?.substring(0, 100),
          answerLength: data.answer?.length,
          startsWithHtml: data.answer?.startsWith('<'),
          containsHtmlTags: data.answer?.includes('<p')
        });
        // Ensure we're setting the HTML string directly
        const htmlAnswer = typeof data.answer === 'string' ? data.answer : String(data.answer || '');
        console.log('🔍 Setting search answer:', {
          type: typeof htmlAnswer,
          length: htmlAnswer.length,
          firstChars: htmlAnswer.substring(0, 50)
        });
        setSearchAnswer(htmlAnswer);
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

  const handleSaveField = async (field: string) => {
    if (!editValues[field] && field !== 'isPublic') return;
    
    setIsSaving(true);
    try {
      const updates: Record<string, any> = {};
      
      if (field === 'tags') {
        updates.tags = editValues.tags || [];
      } else if (field === 'category') {
        updates.category = editValues.category;
      } else if (field === 'complexity') {
        updates.complexity = editValues.complexity;
      } else if (field === 'isPublic') {
        updates.isPublic = editValues.isPublic !== undefined ? editValues.isPublic : blueprint.isPublic;
      } else {
        updates[field] = editValues[field];
      }

      const response = await fetch(`/api/blueprints/${blueprint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        setBlueprint(updated);
        setEditingField(null);
        setEditValues({});
        onUpdate?.(updated);
      } else {
        alert('Failed to update blueprint');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to update blueprint');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (field: string, currentValue: any) => {
    setEditingField(field);
    if (field === 'tags') {
      setEditValues({ tags: Array.isArray(currentValue) ? [...currentValue] : [] });
    } else {
      setEditValues({ [field]: currentValue });
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editValues.tags?.includes(tag.trim())) {
      setEditValues({ tags: [...(editValues.tags || []), tag.trim()] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditValues({ tags: (editValues.tags || []).filter((t: string) => t !== tagToRemove) });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (level: string | number | undefined | null) => {
    // Handle null, undefined, or non-string values
    if (!level) {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
    
    // Convert to string and lowercase
    const levelStr = String(level).toLowerCase().trim();
    
    switch (levelStr) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const downloadJSON = () => {
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blueprint-${blueprint.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'components', label: 'Components', icon: Target },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'search', label: 'AI Search', icon: Brain },
    { id: 'json', label: 'JSON Export', icon: FileText },
  ];

  if (!isOpen) return null;

  // Render as page or modal based on asPage prop
  const wrapperClass = asPage 
    ? 'w-full' 
    : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto';
  
  const contentClass = asPage
    ? 'bg-surface border border-border rounded-xl shadow-lg w-full overflow-hidden'
    : 'bg-surface border border-border rounded-xl shadow-xl w-full max-w-7xl my-8 overflow-hidden';

  return (
    <div className={wrapperClass}>
      <div className={contentClass}>
        {/* Header - Similar to AnalysisResults */}
        <div className="bg-surface border-b border-border rounded-t-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getFileIcon(blueprint.type)}
                  </div>
                  <div className="flex-1">
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValues.name || blueprint.name}
                          onChange={(e) => setEditValues({ name: e.target.value })}
                          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveField('name')}
                          disabled={isSaving}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold text-foreground">{blueprint.name}</h2>
                        <button
                          onClick={() => startEditing('name', blueprint.name)}
                          className="p-1 text-foreground-muted hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="Edit name"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-foreground-muted">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="font-medium">{blueprint.fileName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(blueprint.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{blueprint.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span className="capitalize">{blueprint.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Blueprint Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Category</div>
                    {editingField === 'category' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editValues.category || blueprint.category}
                          onChange={(e) => setEditValues({ category: e.target.value })}
                          className="flex-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Object.values(BlueprintCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button onClick={() => handleSaveField('category')} className="p-1 text-green-600">
                          <Save className="w-3 h-3" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-600">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-foreground">{blueprint.category}</div>
                        <button onClick={() => startEditing('category', blueprint.category)} className="p-0.5 text-foreground-muted hover:text-foreground">
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Complexity</div>
                    {editingField === 'complexity' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editValues.complexity || blueprint.complexity}
                          onChange={(e) => setEditValues({ complexity: e.target.value })}
                          className="flex-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Object.values(BlueprintComplexity).map(comp => (
                            <option key={comp} value={comp}>{comp}</option>
                          ))}
                        </select>
                        <button onClick={() => handleSaveField('complexity')} className="p-1 text-green-600">
                          <Save className="w-3 h-3" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-600">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(blueprint.complexity)}`}>
                          {blueprint.complexity}
                        </span>
                        <button onClick={() => startEditing('complexity', blueprint.complexity)} className="p-0.5 text-foreground-muted hover:text-foreground">
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Components</div>
                    <div className="text-sm font-semibold text-foreground">{blueprint.metadata?.components || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Connections</div>
                    <div className="text-sm font-semibold text-foreground">{blueprint.metadata?.connections || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Version</div>
                    <div className="text-sm font-semibold text-foreground font-mono">v{blueprint.version}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={downloadJSON}
                className="flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary hover:border-border-hover transition-all duration-200 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {onDownload && (
                <button
                  onClick={() => onDownload(blueprint)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary hover:border-border-hover transition-all duration-200 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(blueprint)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-error/20 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
              {!asPage && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Score Cards - Similar to AnalysisResults */}
        {blueprint.analysisScores && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-border">
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
                <div className={`text-3xl font-bold ${getScoreColor(blueprint.analysisScores.security)}`}>
                  {blueprint.analysisScores.security}
                </div>
                <div className="text-sm text-foreground-muted mb-1">/100</div>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    blueprint.analysisScores.security >= 80 ? 'bg-success' :
                    blueprint.analysisScores.security >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${blueprint.analysisScores.security}%` }}
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
                <div className={`text-3xl font-bold ${getScoreColor(blueprint.analysisScores.resiliency)}`}>
                  {blueprint.analysisScores.resiliency}
                </div>
                <div className="text-sm text-foreground-muted mb-1">/100</div>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    blueprint.analysisScores.resiliency >= 80 ? 'bg-success' :
                    blueprint.analysisScores.resiliency >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${blueprint.analysisScores.resiliency}%` }}
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
                  <div className="text-xs text-foreground-muted">Optimization</div>
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <div className={`text-3xl font-bold ${getScoreColor(blueprint.analysisScores.costEfficiency)}`}>
                  {blueprint.analysisScores.costEfficiency}
                </div>
                <div className="text-sm text-foreground-muted mb-1">/100</div>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    blueprint.analysisScores.costEfficiency >= 80 ? 'bg-success' :
                    blueprint.analysisScores.costEfficiency >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${blueprint.analysisScores.costEfficiency}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">Compliance</span>
                  <div className="text-xs text-foreground-muted">Standards Adherence</div>
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <div className={`text-3xl font-bold ${getScoreColor(blueprint.analysisScores.compliance)}`}>
                  {blueprint.analysisScores.compliance}
                </div>
                <div className="text-sm text-foreground-muted mb-1">/100</div>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    blueprint.analysisScores.compliance >= 80 ? 'bg-success' :
                    blueprint.analysisScores.compliance >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${blueprint.analysisScores.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-500px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Blueprint Image Preview - Always show for architecture type, or if fileType indicates image */}
              {(blueprint.type === 'architecture' || blueprint.fileType?.startsWith('image/')) && (
                <div className="bg-secondary rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Blueprint Diagram
                    </h3>
                    {onDownload && (
                      <a
                        href={`/api/blueprints/${blueprint.id}/download`}
                        download={blueprint.fileName}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                  <div className="relative bg-muted rounded-lg overflow-hidden border border-border">
                    {(blueprint as any).originalFile?.data ? (
                      <img
                        src={`data:${(blueprint as any).originalFile.mimeType || 'image/png'};base64,${(blueprint as any).originalFile.data}`}
                        alt={blueprint.fileName || 'Blueprint diagram'}
                        className="w-full h-auto max-h-[600px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const url = `data:${(blueprint as any).originalFile.mimeType || 'image/png'};base64,${(blueprint as any).originalFile.data}`;
                          setImageUrl(url);
                          setShowImageModal(true);
                        }}
                      />
                    ) : (
                      <img
                        src={`/api/blueprints/${blueprint.id}/file`}
                        alt={blueprint.fileName || 'Blueprint diagram'}
                        className="w-full h-auto max-h-[600px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setImageUrl(`/api/blueprints/${blueprint.id}/file`);
                          setShowImageModal(true);
                        }}
                        onError={(e) => {
                          console.error('Failed to load blueprint image:', e);
                          // Hide the entire image section if image fails to load
                          const imageSection = (e.target as HTMLElement).closest('.bg-secondary');
                          if (imageSection) {
                            (imageSection as HTMLElement).style.display = 'none';
                          }
                        }}
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          const url = (blueprint as any).originalFile?.data 
                            ? `data:${(blueprint as any).originalFile.mimeType || 'image/png'};base64,${(blueprint as any).originalFile.data}`
                            : `/api/blueprints/${blueprint.id}/file`;
                          setImageUrl(url);
                          setShowImageModal(true);
                        }}
                        className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors backdrop-blur-sm"
                        title="View full size"
                      >
                        <Image className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on the image to view in full size
                  </p>
                </div>
              )}

              {/* Description - Editable */}
              <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Description</h3>
                  {editingField !== 'description' && (
                    <button
                      onClick={() => startEditing('description', blueprint.description)}
                      className="p-1 text-foreground-muted hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'description' ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValues.description || blueprint.description}
                      onChange={(e) => setEditValues({ description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('description')}
                        disabled={isSaving}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary-hover"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 border border-border rounded text-sm hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{blueprint.description}</p>
                )}
              </div>

              {/* Creator Description - Editable */}
              {(blueprint as any).creatorDescription && (
                <div className="bg-secondary rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground">Enterprise Context & Details</h3>
                    {editingField !== 'creatorDescription' && (
                      <button
                        onClick={() => startEditing('creatorDescription', (blueprint as any).creatorDescription || '')}
                        className="p-1 text-foreground-muted hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingField === 'creatorDescription' ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValues.creatorDescription || (blueprint as any).creatorDescription || ''}
                        onChange={(e) => setEditValues({ creatorDescription: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Add enterprise context, best practices, deployment notes..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveField('creatorDescription')}
                          disabled={isSaving}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary-hover"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 border border-border rounded text-sm hover:bg-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">{(blueprint as any).creatorDescription || 'No additional details provided.'}</p>
                  )}
                </div>
              )}

              {/* Tags - Editable */}
              <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Tags</h3>
                  {editingField !== 'tags' && (
                    <button
                      onClick={() => startEditing('tags', blueprint.tags)}
                      className="p-1 text-foreground-muted hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'tags' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(editValues.tags || []).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary/80"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleSaveField('tags')}
                        disabled={isSaving}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary-hover"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 border border-border rounded text-sm hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {blueprint.tags.length > 0 ? (
                      blueprint.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No tags</span>
                    )}
                  </div>
                )}
              </div>

              {/* Visibility - Editable */}
              <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Visibility</h3>
                    <p className="text-sm text-muted-foreground">Control who can view this blueprint</p>
                  </div>
                  {editingField === 'isPublic' ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editValues.isPublic !== undefined ? editValues.isPublic.toString() : blueprint.isPublic.toString()}
                        onChange={(e) => setEditValues({ isPublic: e.target.value === 'true' })}
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                      </select>
                      <button
                        onClick={() => handleSaveField('isPublic')}
                        disabled={isSaving}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {blueprint.isPublic ? <Eye className="w-5 h-5 text-green-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                        <span className="font-medium">{blueprint.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                      <button
                        onClick={() => startEditing('isPublic', blueprint.isPublic)}
                        className="p-1 text-foreground-muted hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Key Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Components:</span>
                      <span className="font-medium text-foreground">{blueprint.metadata?.components || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="font-medium text-foreground">{blueprint.metadata?.connections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cloud Providers:</span>
                      <span className="font-medium text-foreground">{blueprint.cloudProviders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className="font-medium text-foreground">{blueprint.downloadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium text-foreground">{blueprint.rating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Cloud Providers</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.cloudProviders.length > 0 ? (
                      blueprint.cloudProviders.map(provider => (
                        <span key={provider} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {provider}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No cloud providers specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Architecture Metadata */}
              {blueprint.metadata && (
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Architecture Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blueprint.metadata.architectureType && (
                      <div>
                        <div className="text-sm text-foreground-muted">Architecture Type</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.architectureType}</div>
                      </div>
                    )}
                    {blueprint.metadata.primaryCloudProvider && (
                      <div>
                        <div className="text-sm text-foreground-muted">Primary Cloud Provider</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.primaryCloudProvider}</div>
                      </div>
                    )}
                    {blueprint.metadata.hybridCloudModel && (
                      <div>
                        <div className="text-sm text-foreground-muted">Hybrid Cloud Model</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.hybridCloudModel}</div>
                      </div>
                    )}
                    {blueprint.metadata.deploymentModel && (
                      <div>
                        <div className="text-sm text-foreground-muted">Deployment Model</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.deploymentModel}</div>
                      </div>
                    )}
                    {blueprint.metadata.primaryPurpose && (
                      <div>
                        <div className="text-sm text-foreground-muted">Primary Purpose</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.primaryPurpose}</div>
                      </div>
                    )}
                    {blueprint.metadata.environmentType && (
                      <div>
                        <div className="text-sm text-foreground-muted">Environment Type</div>
                        <div className="text-lg font-semibold text-foreground capitalize">{blueprint.metadata.environmentType}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-4">
              {/* Extracted Components */}
              {blueprint.metadata?.extractedComponents && blueprint.metadata.extractedComponents.length > 0 ? (
                (() => {
                  const componentsByCategory = blueprint.metadata.extractedComponents.reduce((acc: Record<string, any[]>, comp: any) => {
                    const category = comp.terraformCategory || 'Uncategorized';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(comp);
                    return acc;
                  }, {});

                  return (
                    <div className="space-y-4">
                      {Object.entries(componentsByCategory).map(([category, components]) => (
                        <div key={category} className="bg-secondary rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            {category} ({components.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {components.map((comp: any, idx: number) => (
                              <div key={idx} className="bg-surface rounded-lg p-4 border border-border">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-foreground">{comp.name || comp.id || `Component ${idx + 1}`}</h5>
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                                    {comp.type || 'unknown'}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {comp.cloudProvider && (
                                    <div>Provider: <span className="capitalize">{comp.cloudProvider}</span></div>
                                  )}
                                  {comp.cloudService && (
                                    <div>Service: {comp.cloudService}</div>
                                  )}
                                  {comp.deployedEnvironment && (
                                    <div>Environment: {comp.deployedEnvironment}</div>
                                  )}
                                  {comp.description && (
                                    <div className="mt-2 text-xs">{comp.description}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : analysis?.components && analysis.components.length > 0 ? (
                (() => {
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
                          <div key={category} className="bg-secondary rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              {category} ({components.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {components.map((comp: any, idx: number) => (
                                <div key={idx} className="bg-surface rounded-lg p-4 border border-border">
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-medium text-foreground">{comp.name}</h5>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      comp.criticality === 'high' ? 'bg-red-100 text-red-800' : 
                                      comp.criticality === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {comp.criticality}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div>Type: <span className="capitalize">{comp.type}</span></div>
                                    {comp.technology && <div>Technology: {comp.technology}</div>}
                                    {comp.scalability && <div>Scalability: {comp.scalability}</div>}
                                    {comp.securityLevel && <div>Security: {comp.securityLevel}</div>}
                                    {comp.description && (
                                      <div className="mt-2 text-xs">{comp.description}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <Server className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">No components available</p>
                </div>
              )}

              {/* Connections */}
              {(blueprint.metadata?.extractedConnections && blueprint.metadata.extractedConnections.length > 0) || 
               (analysis?.componentRelationships && analysis.componentRelationships.length > 0) ? (
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Connections ({blueprint.metadata?.extractedConnections?.length || analysis?.componentRelationships?.length || 0})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(blueprint.metadata?.extractedConnections || analysis?.componentRelationships || []).map((conn: any, idx: number) => (
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
              ) : null}
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
                  {/* Architecture Patterns & Technology Stack */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.architecturePatterns && analysis.architecturePatterns.length > 0 && (
                      <div className="bg-secondary rounded-lg p-6">
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
                      <div className="bg-secondary rounded-lg p-6">
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
                    <div className="bg-secondary rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Component Complexity</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-sm text-foreground-muted">Total Components</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.totalComponents || 0}</div>
                        </div>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-sm text-foreground-muted">Critical Components</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.criticalComponents || 0}</div>
                        </div>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-sm text-foreground-muted">High Coupling</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.highCouplingComponents || 0}</div>
                        </div>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-sm text-foreground-muted">Integration Points</div>
                          <div className="text-2xl font-bold text-foreground">{analysis.componentComplexity.integrationPoints || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="bg-secondary rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
                      <div className="space-y-2">
                        {analysis.insights.map((insight: string, idx: number) => (
                          <div key={idx} className="bg-surface rounded-lg p-4 flex items-start gap-3 border border-border">
                            <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-foreground">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Practices */}
                  {analysis.bestPractices && analysis.bestPractices.length > 0 && (
                    <div className="bg-secondary rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Best Practices</h3>
                      <ul className="space-y-2">
                        {analysis.bestPractices.map((practice: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-foreground">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : !loadingAnalysis ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">No analysis available for this blueprint.</p>
                  <div className="mt-4 text-sm text-foreground-muted">
                    <p>Blueprint ID: {blueprint.id}</p>
                    <p>Has Analysis Flag: {blueprint.hasAnalysis ? 'Yes' : 'No'}</p>
                    <p>Last Analysis ID: {blueprint.lastAnalysisId || 'None'}</p>
                  </div>
                  {onAnalyze && (
                    <button
                      onClick={() => onAnalyze(blueprint)}
                      className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
                    >
                      Run Analysis
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-4">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-foreground-muted">Loading analysis...</span>
                </div>
              ) : analysis?.risks && analysis.risks.length > 0 ? (
                analysis.risks.map((risk: any, idx: number) => (
                  <div key={idx} className="bg-secondary rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{risk.title || risk.name || 'Unknown Risk'}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(risk.level || 'medium')}`}>
                        {(risk.level || 'medium').toString().toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{risk.description || 'No description available'}</p>
                    {risk.recommendations && Array.isArray(risk.recommendations) && risk.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-foreground">Recommendations:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {risk.recommendations.map((rec: any, recIdx: number) => (
                            <li key={recIdx} className="text-sm text-muted-foreground">
                              {typeof rec === 'string' ? rec : String(rec)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : !loadingAnalysis ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No risks identified</p>
                  {analysis && (
                    <p className="text-xs mt-2">Analysis loaded but no risks found. Risks: {analysis.risks?.length || 0}</p>
                  )}
                </div>
              ) : null}

              {analysis?.complianceGaps && Array.isArray(analysis.complianceGaps) && analysis.complianceGaps.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Gaps</h3>
                  <div className="space-y-4">
                    {analysis.complianceGaps.map((gap: any, idx: number) => (
                      <div key={idx} className="bg-secondary rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{gap.requirement || 'Unknown Requirement'}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(gap.severity || 'medium')}`}>
                            {(gap.severity || 'medium').toString().toUpperCase()}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{gap.description || 'No description available'}</p>
                        {gap.remediation && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-foreground">Remediation:</h5>
                            <p className="text-sm text-muted-foreground">{gap.remediation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {analysis?.costIssues && Array.isArray(analysis.costIssues) && analysis.costIssues.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Cost Issues</h3>
                  <div className="space-y-4">
                    {analysis.costIssues.map((issue: any, idx: number) => (
                      <div key={idx} className="bg-secondary rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{issue.title || 'Unknown Cost Issue'}</h4>
                          {issue.estimatedSavingsUSD && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ${issue.estimatedSavingsUSD.toLocaleString()} savings
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{issue.description || 'No description available'}</p>
                        {issue.recommendation && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-foreground">Recommendation:</h5>
                            <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-foreground-muted">Loading analysis...</span>
                </div>
              ) : analysis?.recommendations && analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-secondary rounded-lg p-4 border-l-4 border-primary">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{rec.component || 'General'}</div>
                        <div className="text-sm text-muted-foreground mt-1">{rec.issue}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(rec.priority || 'medium')}`}>
                          {(rec.priority || 'medium').toString().toUpperCase()}
                        </span>
                        {rec.effort && (
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                            {rec.effort} effort
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{rec.recommendation || rec.fix || 'No recommendation provided'}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {rec.impact && <span>Impact: {rec.impact}</span>}
                      {rec.confidence && <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>}
                      {rec.category && <span>Category: {rec.category}</span>}
                    </div>
                  </div>
                ))
              ) : !loadingAnalysis ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recommendations available</p>
                  {analysis && (
                    <p className="text-xs mt-2">Analysis loaded but no recommendations found. Recommendations: {analysis.recommendations?.length || 0}</p>
                  )}
                  {!analysis && (
                    <p className="text-sm mt-2">Analysis data not available. Try running analysis.</p>
                  )}
                </div>
              ) : null}
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
                    placeholder="e.g., What are the security recommendations? What components are critical?"
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
                  <div className="bg-secondary rounded-lg p-6 border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Answer</h4>
                        <div 
                          className="text-foreground markdown-content prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: searchAnswer }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Example Questions */}
                {!searchAnswer && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Example Questions:</h4>
                    <div className="space-y-2">
                      {[
                        "What are the security recommendations for this blueprint?",
                        "Which components are critical and why?",
                        "What architecture patterns are used?",
                        "What is the scalability score and what are the bottlenecks?",
                        "What technologies are used in this blueprint?"
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

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">JSON Export</h3>
                <button
                  onClick={downloadJSON}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm text-foreground max-h-96">
                {JSON.stringify(blueprint, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Full Size Image Modal */}
      {showImageModal && imageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageUrl}
              alt={blueprint.fileName || 'Blueprint diagram'}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
