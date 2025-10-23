"use client";

import { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  ChevronRight,
  X
} from 'lucide-react';
import { Blueprint } from '@/types/blueprint';
import { formatDate } from '@/utils/dateUtils';

interface BlueprintVersion {
  id: string;
  version: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  isCurrent: boolean;
  fileSize: number;
  fileName: string;
  fileType: string;
  downloadCount: number;
  changes: string[];
  isStable: boolean;
}

interface BlueprintVersionManagerProps {
  blueprint: Blueprint;
  isOpen: boolean;
  onClose: () => void;
  onVersionSelect?: (version: BlueprintVersion) => void;
  onVersionDelete?: (version: BlueprintVersion) => void;
  onNewVersion?: (version: BlueprintVersion) => void;
}

export function BlueprintVersionManager({ 
  blueprint, 
  isOpen, 
  onClose, 
  onVersionSelect,
  onVersionDelete,
  onNewVersion 
}: BlueprintVersionManagerProps) {
  const [versions, setVersions] = useState<BlueprintVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    version: '',
    description: '',
    changes: [] as string[],
    isStable: false
  });
  const [changeInput, setChangeInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, blueprint.id]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockVersions: BlueprintVersion[] = [
        {
          id: 'v1',
          version: '1.2.0',
          description: 'Latest stable release with performance improvements',
          createdAt: new Date('2024-01-15'),
          createdBy: 'John Doe',
          isCurrent: true,
          fileSize: 2048576,
          fileName: 'blueprint-v1.2.0.tf',
          fileType: 'text/plain',
          downloadCount: 45,
          changes: [
            'Added support for multi-region deployment',
            'Improved error handling',
            'Updated documentation'
          ],
          isStable: true
        },
        {
          id: 'v2',
          version: '1.1.0',
          description: 'Previous stable release',
          createdAt: new Date('2024-01-10'),
          createdBy: 'John Doe',
          isCurrent: false,
          fileSize: 1987654,
          fileName: 'blueprint-v1.1.0.tf',
          fileType: 'text/plain',
          downloadCount: 32,
          changes: [
            'Added monitoring configuration',
            'Fixed security vulnerabilities',
            'Updated dependencies'
          ],
          isStable: true
        },
        {
          id: 'v3',
          version: '1.0.0',
          description: 'Initial release',
          createdAt: new Date('2024-01-05'),
          createdBy: 'John Doe',
          isCurrent: false,
          fileSize: 1854321,
          fileName: 'blueprint-v1.0.0.tf',
          fileType: 'text/plain',
          downloadCount: 28,
          changes: [
            'Initial blueprint implementation',
            'Basic infrastructure setup',
            'Core functionality'
          ],
          isStable: true
        }
      ];
      
      setVersions(mockVersions);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChange = () => {
    if (changeInput.trim()) {
      setNewVersionData(prev => ({
        ...prev,
        changes: [...prev.changes, changeInput.trim()]
      }));
      setChangeInput('');
    }
  };

  const handleRemoveChange = (index: number) => {
    setNewVersionData(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }));
  };

  const handleCreateVersion = () => {
    if (!newVersionData.version || !newVersionData.description) return;

    const newVersion: BlueprintVersion = {
      id: `v${Date.now()}`,
      version: newVersionData.version,
      description: newVersionData.description,
      createdAt: new Date(),
      createdBy: 'Current User',
      isCurrent: false,
      fileSize: blueprint.fileSize,
      fileName: `${blueprint.fileName.split('.')[0]}-v${newVersionData.version}.${blueprint.fileName.split('.').pop()}`,
      fileType: blueprint.fileType,
      downloadCount: 0,
      changes: newVersionData.changes,
      isStable: newVersionData.isStable
    };

    setVersions(prev => [newVersion, ...prev]);
    onNewVersion?.(newVersion);
    setShowNewVersion(false);
    setNewVersionData({
      version: '',
      description: '',
      changes: [],
      isStable: false
    });
  };

  const handleDownloadVersion = (version: BlueprintVersion) => {
    // Implement download functionality
    console.log('Downloading version:', version.version);
  };

  const handleDeleteVersion = (version: BlueprintVersion) => {
    if (confirm(`Are you sure you want to delete version ${version.version}?`)) {
      setVersions(prev => prev.filter(v => v.id !== version.id));
      onVersionDelete?.(version);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Version Management</h2>
              <p className="text-sm text-foreground-muted">{blueprint.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewVersion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Version
            </button>
            <button
              onClick={onClose}
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {version.isCurrent && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className="font-semibold text-foreground">v{version.version}</span>
                        {version.isStable && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Stable
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadVersion(version)}
                        className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onVersionSelect?.(version)}
                        className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!version.isCurrent && (
                        <button
                          onClick={() => handleDeleteVersion(version)}
                          className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground-muted mb-3">{version.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <Calendar className="w-4 h-4" />
                      {formatDate(version.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <User className="w-4 h-4" />
                      {version.createdBy}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <Download className="w-4 h-4" />
                      {version.downloadCount} downloads
                    </div>
                  </div>

                  {version.changes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Changes:</h4>
                      <ul className="space-y-1">
                        {version.changes.map((change, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {versions.length === 0 && (
                <div className="text-center py-12">
                  <GitBranch className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Versions Available</h3>
                  <p className="text-foreground-muted mb-4">
                    Create the first version of this blueprint.
                  </p>
                  <button
                    onClick={() => setShowNewVersion(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
                  >
                    Create First Version
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Version Modal */}
        {showNewVersion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Create New Version</h3>
                <button
                  onClick={() => setShowNewVersion(false)}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Version Number *
                  </label>
                  <input
                    type="text"
                    value={newVersionData.version}
                    onChange={(e) => setNewVersionData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 1.3.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newVersionData.description}
                    onChange={(e) => setNewVersionData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe what's new in this version"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Changes
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={changeInput}
                      onChange={(e) => setChangeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChange();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Add a change and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddChange}
                      className="px-3 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {newVersionData.changes.map((change, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-2">
                        <span className="text-sm text-foreground">{change}</span>
                        <button
                          onClick={() => handleRemoveChange(index)}
                          className="p-1 text-foreground-muted hover:text-error transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isStable"
                    checked={newVersionData.isStable}
                    onChange={(e) => setNewVersionData(prev => ({ ...prev, isStable: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <label htmlFor="isStable" className="text-sm text-foreground">
                    Mark as stable release
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
                <button
                  onClick={() => setShowNewVersion(false)}
                  className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVersion}
                  disabled={!newVersionData.version || !newVersionData.description}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
                >
                  Create Version
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
