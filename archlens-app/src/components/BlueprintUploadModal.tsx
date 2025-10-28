"use client";

import { useState, useRef } from 'react';
import { X, Upload, FileText, Image, Tag, Info, AlertCircle } from 'lucide-react';
import { Blueprint as BlueprintType, BlueprintCategory } from '@/types/blueprint';

interface Blueprint extends BlueprintType {
  updatedAt: Date;
  downloads: number;
  rating: number;
  author: string;
}

interface BlueprintUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (blueprint: Blueprint) => void;
}

export function BlueprintUploadModal({ isOpen, onClose, onUpload }: BlueprintUploadModalProps) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blueprintData, setBlueprintData] = useState<{
    name: string;
    description: string;
    type: string;
    category: string;
    tags: string[];
    cloudProvider: string;
    complexity: string;
    isPublic: boolean;
    estimatedCost: string;
    deploymentTime: string;
  }>({
    name: '',
    description: '',
    type: 'architecture' as 'architecture' | 'iac' | 'template',
    category: '',
    tags: [] as string[],
    isPublic: true,
    complexity: 'medium' as 'low' | 'medium' | 'high',
    cloudProvider: '',
    estimatedCost: '',
    deploymentTime: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    step: '',
    percentage: 0,
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudProviderOptions = ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Multi-Cloud', 'On-Premises'];
  const categoryOptions = Object.values(BlueprintCategory);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename
      if (!blueprintData.name) {
        setBlueprintData(prev => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        }));
      }
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setBlueprintData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !blueprintData.tags.includes(tagInput.trim())) {
      setBlueprintData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlueprintData(prev => ({
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

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!selectedFile) {
        newErrors.file = 'Please select a file';
      }
    }

    if (stepNumber === 2) {
      if (!blueprintData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!blueprintData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!blueprintData.category) {
        newErrors.category = 'Category is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(2)) {
      try {
        setIsUploading(true);
        setUploadProgress({
          step: 'uploading',
          percentage: 10,
          message: 'Uploading blueprint file...'
        });
        
        console.log('📤 Uploading blueprint:', blueprintData.name);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', selectedFile!);
        formData.append('name', blueprintData.name);
        formData.append('description', blueprintData.description);
        formData.append('type', blueprintData.type);
        formData.append('category', blueprintData.category);
        formData.append('tags', JSON.stringify(blueprintData.tags));
        formData.append('cloudProvider', blueprintData.cloudProvider);
        formData.append('complexity', blueprintData.complexity);
        formData.append('isPublic', blueprintData.isPublic.toString());
        formData.append('estimatedCost', blueprintData.estimatedCost);
        formData.append('deploymentTime', blueprintData.deploymentTime);
        
        setUploadProgress({
          step: 'processing',
          percentage: 30,
          message: 'Processing blueprint metadata...'
        });
        
        const response = await fetch('/api/blueprints', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadProgress({
            step: 'analyzing',
            percentage: 60,
            message: 'Analyzing blueprint architecture...'
          });
          
          const newBlueprint = await response.json();
          
          setUploadProgress({
            step: 'embedding',
            percentage: 80,
            message: 'Generating embeddings for similarity search...'
          });
          
          // Simulate additional processing time for analysis and embeddings
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setUploadProgress({
            step: 'complete',
            percentage: 100,
            message: 'Blueprint uploaded and analyzed successfully!'
          });
          
          console.log('✅ Blueprint uploaded successfully:', newBlueprint.name);
          onUpload(newBlueprint);
          
          // Close modal after a brief delay to show completion
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1500);
        } else {
          console.error('❌ Failed to upload blueprint:', response.statusText);
          alert('Failed to upload blueprint. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error uploading blueprint:', error);
        alert('Error uploading blueprint. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedFile(null);
    setBlueprintData({
      name: '',
      description: '',
      type: 'architecture',
      category: '',
      tags: [],
      isPublic: true,
      complexity: 'medium',
      cloudProvider: '',
      estimatedCost: '',
      deploymentTime: ''
    });
    setTagInput('');
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Upload Blueprint</h2>
          <button
            onClick={handleClose}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground-muted'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-foreground-muted">
              {step === 1 && 'Select File'}
              {step === 2 && 'Blueprint Details'}
              {step === 3 && 'Review & Upload'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: File Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select Blueprint File</h3>
                <p className="text-foreground-muted mb-4">
                  Upload an architecture diagram, IAC template, or blueprint file.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFile
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.svg,.tf,.yaml,.yml,.json,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      {selectedFile.type.startsWith('image/') ? (
                        <Image className="w-8 h-8 text-primary" />
                      ) : (
                        <FileText className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-foreground-muted">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-foreground-muted mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-foreground-muted">
                        PNG, JPG, SVG, TF, YAML, JSON, TXT (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {errors.file && (
                <div className="flex items-center gap-2 text-error text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.file}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Supported file types:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Architecture diagrams: PNG, JPG, SVG</li>
                      <li>IAC templates: Terraform (.tf), CloudFormation (.yaml, .json)</li>
                      <li>Kubernetes manifests: YAML, JSON</li>
                      <li>Documentation: TXT, Markdown</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Blueprint Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Blueprint Information</h3>
                <p className="text-foreground-muted mb-4">
                  Provide details about your blueprint to help others discover and use it.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={blueprintData.name}
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
                    value={blueprintData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="architecture">Architecture Diagram</option>
                    <option value="iac">Infrastructure as Code</option>
                    <option value="template">Template</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={blueprintData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe what this blueprint does and how it can be used"
                />
                {errors.description && (
                  <p className="text-error text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={blueprintData.category}
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
                    value={blueprintData.complexity}
                    onChange={(e) => handleInputChange('complexity', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cloud Providers
                </label>
                <div className="flex flex-wrap gap-2">
                  {cloudProviderOptions.map(provider => (
                    <label key={provider} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cloudProvider"
                        checked={blueprintData.cloudProvider === provider}
                        onChange={() => handleInputChange('cloudProvider', provider)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
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
                  {blueprintData.tags.map(tag => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Estimated Cost (USD/month)
                  </label>
                  <input
                    type="number"
                    value={blueprintData.estimatedCost}
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
                    value={blueprintData.deploymentTime}
                    onChange={(e) => handleInputChange('deploymentTime', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 2-3 days, 1 week"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={blueprintData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="isPublic" className="text-sm text-foreground">
                  Make this blueprint public (visible to all users)
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Review & Upload</h3>
                <p className="text-foreground-muted mb-4">
                  Review your blueprint details before uploading.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {selectedFile?.type.startsWith('image/') ? (
                      <Image className="w-6 h-6 text-primary" />
                    ) : (
                      <FileText className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{blueprintData.name}</h4>
                    <p className="text-sm text-foreground-muted">{selectedFile?.name}</p>
                    <p className="text-sm text-foreground-muted">
                      {(selectedFile?.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-foreground-muted mb-2">Description:</p>
                  <p className="text-sm text-foreground">{blueprintData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-foreground-muted">Type:</span>
                    <span className="ml-2 text-foreground capitalize">{blueprintData.type}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Category:</span>
                    <span className="ml-2 text-foreground">{blueprintData.category}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Complexity:</span>
                    <span className="ml-2 text-foreground capitalize">{blueprintData.complexity}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Visibility:</span>
                    <span className="ml-2 text-foreground">{blueprintData.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>

                {blueprintData.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {blueprintData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {blueprintData.cloudProvider && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-2">Cloud Provider:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {blueprintData.cloudProvider}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="px-6 py-4 border-t border-border">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800 font-medium">{uploadProgress.message}</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600 mt-2">
                <span>Step: {uploadProgress.step}</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={step === 1 ? handleClose : handlePrevious}
            disabled={isUploading}
            className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          <div className="flex gap-2">
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={isUploading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Processing...' : 'Upload Blueprint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
