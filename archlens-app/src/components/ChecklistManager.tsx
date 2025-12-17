"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckSquare,
  Square,
  Save,
  X,
  Shield,
  Zap,
  DollarSign,
  Target
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  item: string;
  description: string;
  category: 'security' | 'reliability' | 'performance' | 'cost' | 'compliance';
  recommendedAction: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function ChecklistManager() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    item: '',
    description: '',
    category: 'security',
    recommendedAction: '',
    owner: '',
    priority: 'medium',
    enabled: true
  });

  // Fetch checklist items from API
  useEffect(() => {
    const fetchChecklistItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/checklist');
        if (response.ok) {
          const data = await response.json();
          // Map API response to ChecklistItem format
          const items: ChecklistItem[] = data.map((item: any) => ({
            id: item._id || item.id,
            item: item.item,
            description: item.description || '',
            category: item.category,
            recommendedAction: item.recommendedAction || '',
            owner: item.owner || '',
            priority: item.priority || 'medium',
            enabled: item.enabled !== undefined ? item.enabled : true,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt || item.createdAt)
          }));
          setChecklistItems(items);
        } else {
          console.error('Failed to fetch checklist items');
          setChecklistItems([]);
        }
      } catch (error) {
        console.error('Error fetching checklist items:', error);
        setChecklistItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChecklistItems();
  }, []);

  const filteredItems = checklistItems.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesPriority = !filterPriority || item.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'reliability':
        return <CheckSquare className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'cost':
        return <DollarSign className="w-4 h-4" />;
      case 'compliance':
        return <Target className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'reliability':
        return 'bg-green-100 text-green-800';
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'cost':
        return 'bg-yellow-100 text-yellow-800';
      case 'compliance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = () => {
    if (newItem.item && newItem.description && newItem.recommendedAction) {
      const item: ChecklistItem = {
        id: Date.now().toString(),
        item: newItem.item,
        description: newItem.description,
        category: newItem.category as ChecklistItem['category'],
        recommendedAction: newItem.recommendedAction,
        owner: newItem.owner || 'Unassigned',
        priority: newItem.priority as ChecklistItem['priority'],
        enabled: newItem.enabled || true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setChecklistItems(prev => [item, ...prev]);
      setNewItem({
        item: '',
        description: '',
        category: 'security',
        recommendedAction: '',
        owner: '',
        priority: 'medium',
        enabled: true
      });
      setShowAddModal(false);
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setNewItem(item);
    setShowAddModal(true);
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.item && newItem.description && newItem.recommendedAction) {
      setChecklistItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...newItem, updatedAt: new Date() }
          : item
      ));
      setEditingItem(null);
      setNewItem({
        item: '',
        description: '',
        category: 'security',
        recommendedAction: '',
        owner: '',
        priority: 'medium',
        enabled: true
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this checklist item?')) {
      setChecklistItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleEnabled = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, enabled: !item.enabled, updatedAt: new Date() }
        : item
    ));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setNewItem({
      item: '',
      description: '',
      category: 'security',
      recommendedAction: '',
      owner: '',
      priority: 'medium',
      enabled: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
          <h2 className="text-2xl font-bold text-foreground">Checklist Management</h2>
          <p className="text-foreground-muted">
            Manage security and compliance checklist items for architecture evaluations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search checklist items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="security">Security</option>
            <option value="reliability">Reliability</option>
            <option value="performance">Performance</option>
            <option value="cost">Cost</option>
            <option value="compliance">Compliance</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{checklistItems.length}</p>
              <p className="text-sm text-foreground-muted">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{checklistItems.filter(item => item.enabled).length}</p>
              <p className="text-sm text-foreground-muted">Enabled</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{checklistItems.filter(item => item.priority === 'high').length}</p>
              <p className="text-sm text-foreground-muted">High Priority</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{new Set(checklistItems.map(item => item.category)).size}</p>
              <p className="text-sm text-foreground-muted">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleEnabled(item.id)}
                  className="mt-1 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {item.enabled ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{item.item}</h3>
                  <p className="text-foreground-muted text-sm mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {item.owner}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Recommended Action:</h4>
              <p className="text-sm text-foreground-muted">{item.recommendedAction}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No checklist items found</h3>
          <p className="text-foreground-muted mb-4">
            {searchTerm || filterCategory || filterPriority
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first checklist item.'
            }
          </p>
          {!searchTerm && !filterCategory && !filterPriority && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
            >
              Add Checklist Item
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {editingItem ? 'Edit Checklist Item' : 'Add Checklist Item'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.item || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, item: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter checklist item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe what this checklist item covers"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={newItem.category || 'security'}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ChecklistItem['category'] }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="security">Security</option>
                    <option value="reliability">Reliability</option>
                    <option value="performance">Performance</option>
                    <option value="cost">Cost</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority *
                  </label>
                  <select
                    value={newItem.priority || 'medium'}
                    onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as ChecklistItem['priority'] }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Owner
                </label>
                <input
                  type="text"
                  value={newItem.owner || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter owner/team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recommended Action *
                </label>
                <textarea
                  value={newItem.recommendedAction || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, recommendedAction: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe the recommended action to address this item"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newItem.enabled || false}
                  onChange={(e) => setNewItem(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="enabled" className="text-sm text-foreground">
                  Enable this checklist item
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}