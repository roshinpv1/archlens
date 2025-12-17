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
  GitBranch,
  Grid3x3,
  List,
  Filter,
  RefreshCw,
  Cloud,
  Layers,
  TrendingUp,
  Code
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'search' | 'analytics'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
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

  // Upload functionality removed - blueprints are now created via "Convert to Blueprint" from analysis results

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
    // Navigate to blueprint detail page instead of opening modal
    router.push(`/blueprints/${blueprint.id}`);
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

  // Calculate statistics
  const stats = {
    total: blueprints.length,
    architecture: blueprints.filter(b => b.type === 'architecture').length,
    iac: blueprints.filter(b => b.type === 'iac').length,
    template: blueprints.filter(b => b.type === 'template').length,
    totalDownloads: blueprints.reduce((sum, b) => sum + (b.downloadCount || 0), 0),
    avgRating: blueprints.length > 0 
      ? (blueprints.reduce((sum, b) => sum + (b.rating || 0), 0) / blueprints.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Blueprint Library</h2>
            <p className="text-foreground-muted text-lg">
              Manage and organize your architecture blueprints and IAC templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshBlueprints}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-secondary border border-border text-foreground rounded-lg transition-colors"
              title="Refresh blueprints"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-foreground-muted">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.architecture}</div>
              <div className="text-xs text-foreground-muted">Architecture</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.iac}</div>
              <div className="text-xs text-foreground-muted">IAC</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.template}</div>
              <div className="text-xs text-foreground-muted">Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalDownloads}</div>
              <div className="text-xs text-foreground-muted">Downloads</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.avgRating}</div>
              <div className="text-xs text-foreground-muted">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex border-b border-border lg:border-b-0">
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

          {/* Toolbar */}
          {activeTab === 'list' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search blueprints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || filterType || filterCategory
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface border-border text-foreground hover:bg-secondary'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(filterType || filterCategory) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">
                    {[filterType, filterCategory].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Filters */}
        {activeTab === 'list' && showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="architecture">Architecture</option>
                  <option value="iac">IAC</option>
                  <option value="template">Template</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cloud Provider</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Providers</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                  <option value="Kubernetes">Kubernetes</option>
                  <option value="On-Premises">On-Premises</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Complexity</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {(filterType || filterCategory) && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterCategory('');
                  }}
                  className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === 'search' && (
        <BlueprintSearch
          onFiltersChange={handleSearchFiltersChange}
          initialFilters={searchFilters}
        />
      )}

      {/* Blueprints Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((blueprint) => (
            <div 
              key={blueprint.id} 
              className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Preview */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-muted overflow-hidden">
                {(blueprint as any).originalFile?.data || blueprint.fileType?.startsWith('image/') ? (
                  <img
                    src={(blueprint as any).originalFile?.data 
                      ? `data:${(blueprint as any).originalFile.mimeType || 'image/png'};base64,${(blueprint as any).originalFile.data}`
                      : `/api/blueprints/${blueprint.id}/file`}
                    alt={blueprint.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center">
                      {getFileIcon(blueprint.type)}
                    </div>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleView(blueprint)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Details
                  </button>
                </div>
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                    {blueprint.type}
                  </span>
                </div>
                {/* Rating Badge */}
                {blueprint.rating > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {blueprint.rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1" title={blueprint.name}>
                    {blueprint.name}
                  </h3>
                  <p className="text-sm text-foreground-muted line-clamp-2" title={blueprint.description}>
                    {blueprint.description || 'No description available'}
                  </p>
                </div>

                {/* Tags and Metadata */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getComplexityColor(blueprint.complexity)}`}>
                      {blueprint.complexity} complexity
                    </span>
                    {blueprint.cloudProviders && blueprint.cloudProviders.length > 0 && (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        {blueprint.cloudProviders[0]}
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-muted text-foreground-muted rounded-full text-xs font-medium whitespace-nowrap">
                      v{blueprint.version}
                    </span>
                  </div>

                  {blueprint.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {blueprint.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-muted text-foreground-muted rounded text-xs whitespace-nowrap" title={tag}>
                          {tag}
                        </span>
                      ))}
                      {blueprint.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-muted text-foreground-muted rounded text-xs whitespace-nowrap">
                          +{blueprint.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-foreground-muted pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{blueprint.downloadCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(blueprint.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(blueprint)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(blueprint)}
                    className="px-3 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
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
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlueprints.map((blueprint) => (
            <div 
              key={blueprint.id} 
              className="bg-surface border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-5">
                {/* Thumbnail */}
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-muted rounded-lg overflow-hidden flex-shrink-0">
                  {(blueprint as any).originalFile?.data || blueprint.fileType?.startsWith('image/') ? (
                    <img
                      src={(blueprint as any).originalFile?.data 
                        ? `data:${(blueprint as any).originalFile.mimeType || 'image/png'};base64,${(blueprint as any).originalFile.data}`
                        : `/api/blueprints/${blueprint.id}/file`}
                      alt={blueprint.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(blueprint.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg mb-1" title={blueprint.name}>
                        {blueprint.name}
                      </h3>
                      <p className="text-sm text-foreground-muted line-clamp-2 mb-3" title={blueprint.description}>
                        {blueprint.description || 'No description available'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {blueprint.rating > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                          <Star className="w-4 h-4 fill-yellow-600" />
                          {blueprint.rating}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getComplexityColor(blueprint.complexity)}`}>
                      {blueprint.complexity} complexity
                    </span>
                    {blueprint.cloudProviders && blueprint.cloudProviders.length > 0 && (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        {blueprint.cloudProviders[0]}
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-muted text-foreground-muted rounded-full text-xs font-medium">
                      v{blueprint.version}
                    </span>
                    <span className="text-xs text-foreground-muted flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {blueprint.downloadCount || 0} downloads
                    </span>
                    <span className="text-xs text-foreground-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(blueprint.createdAt)}
                    </span>
                  </div>

                  {blueprint.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {blueprint.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-muted text-foreground-muted rounded text-xs" title={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(blueprint)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownload(blueprint)}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
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
            </div>
          ))}
        </div>
      )}

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
            <p className="text-sm text-foreground-muted mt-2">
              To create a blueprint, analyze an architecture first, then use the "Convert to Blueprint" button.
            </p>
          )}
        </div>
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
