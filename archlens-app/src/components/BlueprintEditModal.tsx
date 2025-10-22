"use client";

import { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Image, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { Blueprint, BlueprintType, BlueprintCategory, BlueprintComplexity } from '@/types/blueprint';

interface BlueprintEditModalProps {
  blueprint: Blueprint;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlueprint: Blueprint) => void;
}

export function BlueprintEditModal({ blueprint, isOpen, onClose, onSave }: BlueprintEditModalProps) {
  const [formData, setFormData] = useState({
    name: blueprint.name,
    description: blueprint.description,
    type: blueprint.type,
    category: blueprint.category,
    tags: blueprint.tags,
    cloudProviders: blueprint.cloudProviders,
    complexity: blueprint.complexity,
    isPublic: blueprint.isPublic,
    version: blueprint.version,
    estimatedCost: blueprint.metadata?.estimatedCost?.toString() || '',
    deploymentTime: blueprint.metadata?.deploymentTime || ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: blueprint.name,
        description: blueprint.description,
        type: blueprint.type,
        category: blueprint.category,
        tags: blueprint.tags,
        cloudProviders: blueprint.cloudProviders,
        complexity: blueprint.complexity,
        isPublic: blueprint.isPublic,
        version: blueprint.version,
        estimatedCost: blueprint.metadata?.estimatedCost?.toString() || '',
        deploymentTime: blueprint.metadata?.deploymentTime || ''
      });
      setErrors({});
      setSaveMessage('');
    }
  }, [isOpen, blueprint]);

  const cloudProviderOptions = ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Multi-Cloud', 'On-Premises'];
  const categoryOptions = Object.values(BlueprintCategory);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCloudProviderToggle = (provider: string) => {
    setFormData(prev => ({
      ...prev,
      cloudProviders: prev.cloudProviders.includes(provider)
        ? prev.cloudProviders.filter(p => p !== provider)
        : [...prev.cloudProviders, provider]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    if (formData.cloudProviders.length === 0) {
      newErrors.cloudProviders = 'At least one cloud provider is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const updatedBlueprint: Blueprint = {
        ...blueprint,
        name: formData.name,
        description: formData.description,
        type: formData.type as BlueprintType,
        category: formData.category as BlueprintCategory,
        tags: formData.tags,
        cloudProviders: formData.cloudProviders,
        complexity: formData.complexity as BlueprintComplexity,
        isPublic: formData.isPublic,
        version: formData.version,
        updatedAt: new Date(),
        metadata: {
          ...blueprint.metadata,
          estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined,
          deploymentTime: formData.deploymentTime || undefined
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(updatedBlueprint);
      setSaveMessage('Blueprint updated successfully!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setSaveMessage('Failed to update blueprint. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit Blueprint</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter blueprint name"
                />
                {errors.name && (
                  <p className="text-error text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={BlueprintType.ARCHITECTURE}>Architecture Diagram</option>
                  <option value={BlueprintType.IAC}>Infrastructure as Code</option>
                  <option value={BlueprintType.TEMPLATE}>Template</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe what this blueprint does and how it can be used"
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Category and Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-error text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Complexity
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={BlueprintComplexity.LOW}>Low</option>
                <option value={BlueprintComplexity.MEDIUM}>Medium</option>
                <option value={BlueprintComplexity.HIGH}>High</option>
              </select>
            </div>
          </div>

          {/* Cloud Providers */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cloud Providers *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {cloudProviderOptions.map(provider => (
                <label key={provider} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cloudProviders.includes(provider)}
                    onChange={() => handleCloudProviderToggle(provider)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">{provider}</span>
                </label>
              ))}
            </div>
            {errors.cloudProviders && (
              <p className="text-error text-sm mt-1">{errors.cloudProviders}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
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
              {formData.tags.map(tag => (
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
            {errors.tags && (
              <p className="text-error text-sm mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Version and Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estimated Cost (USD/month)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Deployment Time
              </label>
              <input
                type="text"
                value={formData.deploymentTime}
                onChange={(e) => handleInputChange('deploymentTime', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 2-3 days, 1 week"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="isPublic" className="text-sm text-foreground">
              Make this blueprint public (visible to all users)
            </label>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              saveMessage.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage.includes('successfully') ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-foreground-muted">
            Last updated: {blueprint.updatedAt.toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
