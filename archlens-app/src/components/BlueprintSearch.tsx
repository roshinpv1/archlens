"use client";

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  Calendar, 
  Download,
  Tag,
  Cloud,
  Zap,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { BlueprintType, BlueprintCategory, BlueprintComplexity } from '@/types/blueprint';

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

interface BlueprintSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function BlueprintSearch({ onFiltersChange, initialFilters = {} }: BlueprintSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
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
    },
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const cloudProviderOptions = ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Multi-Cloud', 'On-Premises'];
  const categoryOptions = Object.values(BlueprintCategory);
  const typeOptions = Object.values(BlueprintType);
  const complexityOptions = Object.values(BlueprintComplexity);

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean | string[] | number | null | { start: string; end: string }) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      const newTags = [...filters.tags, tagInput.trim()];
      handleFilterChange('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = filters.tags.filter(tag => tag !== tagToRemove);
    handleFilterChange('tags', newTags);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.category) count++;
    if (filters.complexity) count++;
    if (filters.cloudProvider) count++;
    if (filters.tags.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.isPublic !== null) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      {/* Basic Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search blueprints by name, description, or tags..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 border-t border-border pt-6">
          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Complexity and Cloud Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Complexity</label>
              <select
                value={filters.complexity}
                onChange={(e) => handleFilterChange('complexity', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Complexities</option>
                {complexityOptions.map(complexity => (
                  <option key={complexity} value={complexity}>
                    {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cloud Provider</label>
              <select
                value={filters.cloudProvider}
                onChange={(e) => handleFilterChange('cloudProvider', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Providers</option>
                {cloudProviderOptions.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Rating and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Minimum Rating</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-foreground">{filters.minRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
              <select
                value={filters.isPublic === null ? '' : filters.isPublic.toString()}
                onChange={(e) => handleFilterChange('isPublic', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground-muted mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="createdAt">Date Created</option>
                <option value="downloadCount">Downloads</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
                title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
