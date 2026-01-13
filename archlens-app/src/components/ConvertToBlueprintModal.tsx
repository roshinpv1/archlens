"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { BlueprintCategory } from "@/types/blueprint";
import { ArchitectureAnalysis } from "@/types/architecture";

interface ConvertToBlueprintModalProps {
  analysis: ArchitectureAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertToBlueprintModal({
  analysis,
  isOpen,
  onClose,
  onSuccess
}: ConvertToBlueprintModalProps) {
  const [name, setName] = useState(analysis.componentName || `Blueprint from ${analysis.fileName}`);
  const [description, setDescription] = useState(analysis.summary || analysis.architectureDescription || '');
  const [creatorDescription, setCreatorDescription] = useState('');
  const [category, setCategory] = useState<BlueprintCategory>(BlueprintCategory.OTHER);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [complexity, setComplexity] = useState<'low' | 'medium' | 'high'>(
    (analysis.components?.length || 0) > 15 ? 'high' : 
    (analysis.components?.length || 0) > 8 ? 'medium' : 'low'
  );
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleConvert = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      // Extract analysis ID (could be MongoDB _id or custom id)
      // Priority: _id (MongoDB ObjectId) > id (custom string ID)
      const analysisId = (analysis as any)._id?.toString() || analysis.id;
      
      if (!analysisId) {
        setError('Analysis ID is missing. Cannot convert to blueprint.');
        setIsConverting(false);
        return;
      }
      
      console.log('🔄 Converting analysis to blueprint:', {
        analysisId,
        hasId: !!analysis.id,
        has_id: !!(analysis as any)._id,
        analysisKeys: Object.keys(analysis)
      });
      
      const response = await fetch(`/api/analysis/${analysisId}/convert-to-blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          creatorDescription: creatorDescription.trim() || undefined,
          category,
          tags,
          isPublic,
          complexity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert analysis to blueprint');
      }

      const data = await response.json();
      console.log('✅ Blueprint created:', data);
      
      // Show success message
      if (data.success && data.blueprint) {
        // Reset form
        setName(analysis.componentName || `Blueprint from ${analysis.fileName}`);
        setDescription(analysis.summary || analysis.architectureDescription || '');
        setCreatorDescription('');
        setCategory(BlueprintCategory.OTHER);
        setTags([]);
        setIsPublic(true);
        
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Blueprint creation failed');
      }
      
    } catch (err) {
      console.error('❌ Failed to convert to blueprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert analysis to blueprint');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Convert to Blueprint</h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors"
            disabled={isConverting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Blueprint Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter blueprint name"
              disabled={isConverting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter blueprint description"
              disabled={isConverting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Additional Details (Optional)
            </label>
            <textarea
              value={creatorDescription}
              onChange={(e) => setCreatorDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Add enterprise context, best practices, deployment notes, or any additional information about this blueprint..."
              disabled={isConverting}
            />
            <p className="text-xs text-foreground-muted">
              This information will help others understand when and how to use this blueprint.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlueprintCategory)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isConverting}
              >
                {Object.values(BlueprintCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isConverting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a tag and press Enter"
                disabled={isConverting}
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                disabled={isConverting}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/80"
                      disabled={isConverting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              disabled={isConverting}
            />
            <label htmlFor="isPublic" className="text-sm text-foreground">
              Make this blueprint public (visible to all users)
            </label>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium text-foreground">Analysis Summary:</p>
            <ul className="space-y-1 text-foreground-muted">
              <li>• Components: {analysis.components?.length || 0}</li>
              <li>• Connections: {analysis.connections?.length || 0}</li>
              <li>• Security Score: {analysis.securityScore || 0}/100</li>
              <li>• Resiliency Score: {analysis.resiliencyScore || 0}/100</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground"
            disabled={isConverting}
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting || !name.trim() || !description.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Convert to Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

