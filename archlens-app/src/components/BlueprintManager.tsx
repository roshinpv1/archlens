"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Calendar,
  Star,
  Copy,
  X,
  BarChart3,
  GitBranch
} from 'lucide-react';
import { BlueprintUploadModal } from './BlueprintUploadModal';
import { BlueprintViewer } from './BlueprintViewer';
import { BlueprintEditModal } from './BlueprintEditModal';
import { BlueprintVersionManager } from './BlueprintVersionManager';
import { BlueprintSearch } from './BlueprintSearch';
import { BlueprintAnalytics } from './BlueprintAnalytics';
import { BlueprintAnalysisResults } from './BlueprintAnalysisResults';
import { Blueprint, BlueprintType, BlueprintCategory, BlueprintComplexity } from '@/types/blueprint';
import { ComponentAnalysis } from '@/types/componentAnalysis';
import { formatDate } from '@/utils/dateUtils';

interface ComponentRelationship {
  source: string;
  target: string;
  relationship: 'depends_on' | 'communicates_with' | 'scales_with' | 'integrates_with';
  strength?: number;
}

interface SearchFilters {
  search: string;
  type: BlueprintType | '';
  category: BlueprintCategory | '';
  complexity: BlueprintComplexity | '';
  cloudProvider: string;
  tags: string[];
  minRating: number;
  isPublic: boolean | null;
  sortBy: 'name' | 'createdAt' | 'downloadCount' | 'rating';
  sortOrder: 'asc' | 'desc';
  dateRange: {
    start: string;
    end: string;
  };
}

export function BlueprintManager() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'search' | 'analytics'>('list');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    type: '',
    category: '',
    complexity: '',
    cloudProvider: '',
    tags: [],
    minRating: 0,
    isPublic: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [isAnalysisResultsOpen, setIsAnalysisResultsOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{
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
    recommendations: {
      component?: string;
      issue: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
      confidence?: number;
    }[];
    insights: string[];
    bestPractices: string[];
    industryStandards: string[];
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  // Fetch blueprints from API
  useEffect(() => {
    const fetchBlueprints = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching blueprints from API...');
        
        const response = await fetch('/api/blueprints');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Blueprints fetched successfully:', data.blueprints?.length || 0, 'blueprints');
          setBlueprints(data.blueprints || []);
        } else {
          console.error('❌ Failed to fetch blueprints:', response.statusText);
          // Fallback to empty array
          setBlueprints([]);
        }
      } catch (error) {
        console.error('❌ Error fetching blueprints:', error);
        // Fallback to empty array
        setBlueprints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprints();
  }, []);

  const filteredBlueprints = blueprints.filter(blueprint => {
    const matchesSearch = blueprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || blueprint.type === filterType;
    const matchesCategory = !filterCategory || blueprint.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'architecture':
        return <Image className="w-5 h-5" />;
      case 'iac':
        return <FileText className="w-5 h-5" />;
      case 'template':
        return <Copy className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
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

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = (newBlueprint: Blueprint) => {
    // Add the new blueprint to the list
    setBlueprints(prev => [newBlueprint, ...prev]);
    setShowUploadModal(false);
    console.log('✅ Blueprint uploaded successfully:', newBlueprint.name);
  };

  const refreshBlueprints = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing blueprints...');
      
      const response = await fetch('/api/blueprints');
      if (response.ok) {
        const data = await response.json();
        setBlueprints(data.blueprints || []);
        console.log('✅ Blueprints refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing blueprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setShowViewer(true);
  };

  const handleDownload = async (blueprint: Blueprint) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprint.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = blueprint.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Update download count
        setBlueprints(prev => prev.map(b => 
          b.id === blueprint.id 
            ? { ...b, downloadCount: b.downloadCount + 1 }
            : b
        ));
      } else {
        console.error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleEdit = (blueprint: Blueprint) => {
    setEditingBlueprint(blueprint);
    setShowEditModal(true);
  };

  const handleDelete = async (blueprint: Blueprint) => {
    if (confirm(`Are you sure you want to delete "${blueprint.name}"?`)) {
      try {
        console.log('🗑️ Deleting blueprint:', blueprint.name);
        
        const response = await fetch(`/api/blueprints/${blueprint.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('✅ Blueprint deleted successfully');
          // Remove from local state
          setBlueprints(prev => prev.filter(b => b.id !== blueprint.id));
        } else {
          console.error('❌ Failed to delete blueprint:', response.statusText);
          alert('Failed to delete blueprint. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error deleting blueprint:', error);
        alert('Error deleting blueprint. Please try again.');
      }
    }
  };

  const handleRate = async (blueprint: Blueprint, rating: number) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprint.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        // Update the blueprint's rating
        setBlueprints(prev => prev.map(b => 
          b.id === blueprint.id 
            ? { ...b, rating: rating }
            : b
        ));
      }
    } catch (error) {
      console.error('Rating error:', error);
    }
  };

  const handleSaveEdit = async (updatedBlueprint: Blueprint) => {
    try {
      console.log('💾 Saving blueprint changes:', updatedBlueprint.name);
      
      const response = await fetch(`/api/blueprints/${updatedBlueprint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBlueprint),
      });

      if (response.ok) {
        console.log('✅ Blueprint updated successfully');
        // Update local state
        setBlueprints(prev => prev.map(b => 
          b.id === updatedBlueprint.id ? updatedBlueprint : b
        ));
        setShowEditModal(false);
        setEditingBlueprint(null);
      } else {
        console.error('❌ Failed to update blueprint:', response.statusText);
        alert('Failed to update blueprint. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating blueprint:', error);
      alert('Error updating blueprint. Please try again.');
    }
  };

  const handleVersionManager = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setShowVersionManager(true);
  };

  const handleAnalyze = async (blueprint: Blueprint) => {
    try {
      console.log(`🔄 Starting analysis for blueprint: ${blueprint.name}`);
      
      const response = await fetch(`/api/blueprints/${blueprint.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('📊 Analysis response:', responseData);
        
        // Extract the actual analysis data from the response
        const analysis = responseData.analysis || responseData;
        setCurrentAnalysis(analysis);
        setIsAnalysisResultsOpen(true);
        console.log(`✅ Analysis complete for: ${blueprint.name}`);
      } else {
        const error = await response.text();
        console.error('❌ Analysis failed:', error);
        alert('Failed to analyze blueprint. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing blueprint:', error);
      alert('Failed to analyze blueprint. Please try again.');
    }
  };


  const handleSearchFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
    // Apply filters to blueprints
    // This would typically trigger an API call with the filters
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blueprint Library</h2>
          <p className="text-foreground-muted">
            Manage and organize your architecture blueprints and IAC templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshBlueprints}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
            title="Refresh blueprints"
          >
            <Search className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Blueprint
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Blueprints
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Advanced Search
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search blueprints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="architecture">Architecture</option>
                <option value="iac">IAC</option>
                <option value="template">Template</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="E-commerce">E-commerce</option>
                <option value="DevOps">DevOps</option>
                <option value="Web Development">Web Development</option>
              </select>
            </div>
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <BlueprintSearch
          onFiltersChange={handleSearchFiltersChange}
          initialFilters={searchFilters}
        />
      )}

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlueprints.map((blueprint) => (
          <div key={blueprint.id} className="blueprint-card bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                {getFileIcon(blueprint.type)}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="font-semibold text-foreground truncate" title={blueprint.name}>{blueprint.name}</h3>
                <p className="text-sm text-foreground-muted line-clamp-2" title={blueprint.description}>{blueprint.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getComplexityColor(blueprint.complexity)}`}>
                  {blueprint.complexity} complexity
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                  v{blueprint.version}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 overflow-hidden">
                {blueprint.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-muted text-foreground-muted rounded text-xs whitespace-nowrap truncate max-w-20" title={tag}>
                    {tag}
                  </span>
                ))}
                {blueprint.tags.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-foreground-muted rounded text-xs whitespace-nowrap">
                    +{blueprint.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-foreground-muted overflow-hidden">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Download className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{blueprint.downloadCount}</span>
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Star className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{blueprint.rating}</span>
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap min-w-0">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatDate(blueprint.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={() => handleView(blueprint)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors min-w-0"
              >
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">View</span>
              </button>
              <button
                onClick={() => handleDownload(blueprint)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors min-w-0"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Download</span>
              </button>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleVersionManager(blueprint)}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Version Management"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(blueprint)}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(blueprint)}
                  className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlueprints.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No blueprints found</h3>
          <p className="text-foreground-muted mb-4">
            {searchTerm || filterType || filterCategory
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by uploading your first blueprint.'
            }
          </p>
          {!searchTerm && !filterType && !filterCategory && (
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
            >
              Upload Blueprint
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <BlueprintUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadComplete}
      />

      {/* Blueprint Viewer Modal */}
      {selectedBlueprint && (
        <BlueprintViewer
          blueprint={selectedBlueprint}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedBlueprint(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onRate={handleRate}
          onAnalyze={handleAnalyze}
        />
      )}

      {/* Blueprint Edit Modal */}
      {editingBlueprint && (
        <BlueprintEditModal
          blueprint={editingBlueprint}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBlueprint(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Blueprint Version Manager */}
      {selectedBlueprint && (
        <BlueprintVersionManager
          blueprint={selectedBlueprint}
          isOpen={showVersionManager}
          onClose={() => {
            setShowVersionManager(false);
            setSelectedBlueprint(null);
          }}
        />
      )}


      {/* Blueprint Analytics */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Blueprint Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <BlueprintAnalytics />
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Analysis Results Modal */}
      {currentAnalysis && (
        <BlueprintAnalysisResults
          analysis={currentAnalysis}
          isOpen={isAnalysisResultsOpen}
          onClose={() => {
            setIsAnalysisResultsOpen(false);
            setCurrentAnalysis(null);
          }}
        />
      )}
    </div>
  );
}
