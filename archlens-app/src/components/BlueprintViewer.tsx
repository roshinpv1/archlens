"use client";

import { useState } from 'react';
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
  ExternalLink
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
}

export function BlueprintViewer({ 
  blueprint, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onDownload,
  onRate 
}: BlueprintViewerProps) {
  const [currentRating, setCurrentRating] = useState(blueprint.rating);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preview' | 'versions'>('details');

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
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
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
