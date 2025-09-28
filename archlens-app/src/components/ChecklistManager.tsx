"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff, 
  Search, 
  Filter, 
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from "lucide-react";
import { IChecklistItem } from "@/models/ChecklistItem";
import { CHECKLIST_CATEGORIES, PRIORITY_LEVELS, OWNER_TYPES } from "@/types/checklist";

interface ChecklistManagerProps {
  onStatsUpdate: () => void;
}

export function ChecklistManager({ onStatsUpdate }: ChecklistManagerProps) {
  const [items, setItems] = useState<IChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IChecklistItem | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    category: string;
    item: string;
    description: string;
    recommendedAction: string;
    owner: string;
    priority: 'High' | 'Medium' | 'Low';
    enabled: boolean;
  }>({
    category: "",
    item: "",
    description: "",
    recommendedAction: "",
    owner: "",
    priority: "Medium",
    enabled: true
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checklist');
      
      if (!response.ok) {
        throw new Error('Failed to fetch checklist items');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem ? `/api/checklist/${editingItem._id}` : '/api/checklist';
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingItem ? 'update' : 'create'} checklist item`);
      }
      
      await fetchItems();
      onStatsUpdate();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;
    
    try {
      const response = await fetch(`/api/checklist/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete checklist item');
      }
      
      await fetchItems();
      onStatsUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/checklist/${id}?action=toggle`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle checklist item');
      }
      
      await fetchItems();
      onStatsUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleEdit = (item: IChecklistItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      item: item.item,
      description: item.description,
      recommendedAction: item.recommendedAction,
      owner: item.owner,
      priority: item.priority,
      enabled: item.enabled
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      category: "",
      item: "",
      description: "",
      recommendedAction: "",
      owner: "",
      priority: "Medium" as const,
      enabled: true
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-error bg-error-light';
      case 'Medium': return 'text-warning bg-warning-light';
      case 'Low': return 'text-info bg-info-light';
      default: return 'text-foreground-muted bg-muted';
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'enabled' && item.enabled) ||
      (statusFilter === 'disabled' && !item.enabled);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, IChecklistItem[]>);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className="text-sm text-foreground-muted">
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="input-base pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-base"
              >
                <option value="">All categories</option>
                {CHECKLIST_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-base"
              >
                <option value="">All priorities</option>
                {PRIORITY_LEVELS.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base"
              >
                <option value="">All statuses</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-error-light border border-error/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-error mb-1">Error</div>
              <p className="text-error/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {editingItem ? 'Edit Checklist Item' : 'Add New Checklist Item'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Select category</option>
                  {CHECKLIST_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="e.g., Strong authentication"
                  className="input-base"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the requirement"
                className="input-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recommended Action <span className="text-primary">*</span>
              </label>
              <textarea
                value={formData.recommendedAction}
                onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                placeholder="Detailed recommended action or implementation guidance"
                rows={3}
                className="input-base resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Owner <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Select owner</option>
                  {OWNER_TYPES.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="input-base"
                  required
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="enabled" className="text-sm text-foreground">
                    Enabled in evaluations
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Items Found</h3>
          <p className="text-foreground-muted">
            {items.length === 0 
              ? "No checklist items exist yet. Add your first item to get started."
              : "No items match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                {category} ({categoryItems.length})
              </h3>
              
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-surface border rounded-xl p-4 transition-all ${
                      item.enabled ? 'border-border hover:shadow-sm' : 'border-border bg-muted/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-foreground">{item.item}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          {item.enabled ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <Clock className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        
                        <p className="text-foreground-muted text-sm">{item.description}</p>
                        
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-foreground">{item.recommendedAction}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.owner}</span>
                          </div>
                          <div>
                            Updated {new Date(item.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggle(item._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.enabled 
                              ? 'text-success hover:bg-success-light' 
                              : 'text-warning hover:bg-warning-light'
                          }`}
                          title={item.enabled ? 'Disable item' : 'Enable item'}
                        >
                          {item.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="Edit item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
