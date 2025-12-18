"use client";

import { useState } from "react";
import { X, Upload, AlertCircle, CheckCircle, FileText, ImageIcon, Code } from "lucide-react";
import { AnalysisRequest, AnalysisProgress, ComplianceFramework } from "@/types/architecture";
import { AnalysisOptionsModal } from "./AnalysisOptionsModal";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisStart: (progress: AnalysisProgress) => void;
  onAnalysisComplete: (results: unknown) => void;
}

export function EvaluationModal({ isOpen, onClose, onAnalysisStart, onAnalysisComplete }: EvaluationModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [selectedReviewOptions, setSelectedReviewOptions] = useState<string[]>([]);
  
  // Form fields
  const [appId, setAppId] = useState("");
  const [componentName, setComponentName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [version, setVersion] = useState("");

  const validateFile = (file: File): string | null => {
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedTextTypes = ['text/plain', 'application/json', 'text/yaml', 'text/yml'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 25MB';
    }
    
    const isImage = allowedImageTypes.includes(file.type);
    const isText = allowedTextTypes.includes(file.type) || 
                   file.name.endsWith('.tf') || 
                   file.name.endsWith('.yaml') || 
                   file.name.endsWith('.yml') || 
                   file.name.endsWith('.json') ||
                   file.name.endsWith('.xml');
    
    if (!isImage && !isText) {
      return 'Please upload an image file or Infrastructure as Code file (Terraform, YAML, JSON, XML)';
    }
    
    return null;
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const validation = validateFile(file);
    
    if (validation) {
      setError(validation);
      setSelectedFile(null);
    } else {
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-info" />;
    } else if (file.name.endsWith('.tf')) {
      return <Code className="w-6 h-6 text-warning" />;
    } else {
      return <FileText className="w-6 h-6 text-success" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAnalyze = () => {
    if (!selectedFile || !appId.trim() || !componentName.trim()) return;
    
    // Show analysis options modal first
    setShowAnalysisOptions(true);
  };

  const handleAnalysisOptionsConfirm = async (options: string[]) => {
    setSelectedReviewOptions(options);
    setShowAnalysisOptions(false);
    
    // Now proceed with analysis
    await performAnalysis(options);
  };

  const performAnalysis = async (reviewOptions: string[]) => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const request: AnalysisRequest = {
      file: selectedFile,
      metadata: {
        appId: appId.trim(),
        componentName: componentName.trim(),
        description: description.trim() || undefined,
        environment: environment,
        version: version.trim() || undefined,
      },
      analysisOptions: {
        includeCostAnalysis: true,
        includeComplianceCheck: true,
        frameworks: [ComplianceFramework.CIS, ComplianceFramework.PCI_DSS, ComplianceFramework.SOC2],
        focusAreas: ['security', 'reliability', 'cost']
      }
    };

    // Debug: Log the request data
    console.log('📝 Sending analysis request:');
    console.log('appId:', request.metadata?.appId);
    console.log('componentName:', request.metadata?.componentName);
    console.log('description:', request.metadata?.description);
    console.log('environment:', request.metadata?.environment);
    console.log('version:', request.metadata?.version);

    onAnalysisStart({
      stage: "uploading",
      progress: 0,
      message: "Starting analysis..."
    });

    try {
      const formData = new FormData();
      formData.append('file', request.file);
      // Send individual fields as expected by the analyze route
      formData.append('appId', request.metadata?.appId || '');
      formData.append('componentName', request.metadata?.componentName || '');
      if (request.metadata?.description) {
        formData.append('description', request.metadata.description);
      }
      formData.append('environment', request.metadata?.environment || 'development');
      if (request.metadata?.version) {
        formData.append('version', request.metadata.version);
      }
      // Add review options
      formData.append('reviewOptions', JSON.stringify(reviewOptions));

      onAnalysisStart({
        stage: "processing",
        progress: 20,
        message: "Processing file..."
      });

      onAnalysisStart({
        stage: "analyzing",
        progress: 50,
        message: "Analyzing architecture..."
      });

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Analysis failed');
      }

      onAnalysisStart({
        stage: "generating",
        progress: 90,
        message: "Generating report..."
      });

      const results = await response.json();

      onAnalysisStart({
        stage: "complete",
        progress: 100,
        message: "Analysis complete!"
      });

      // Close modal and show results
      onAnalysisComplete(results);
      handleClose();

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      onAnalysisStart({
        stage: "error",
        progress: 0,
        message: "Analysis failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    if (!isAnalyzing) {
      setSelectedFile(null);
      setError(null);
      setAppId("");
      setComponentName("");
      setDescription("");
      setEnvironment("production");
      setVersion("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-surface rounded-xl shadow-xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-foreground">New Architecture Evaluation</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Upload your architecture diagram or Infrastructure as Code file for comprehensive analysis
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isAnalyzing}
              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Architecture File <span className="text-primary">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-primary bg-primary-light/50 scale-[1.02]"
                    : selectedFile
                    ? "border-success bg-success-light/50"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  accept="image/*,.tf,.yaml,.yml,.json,.xml,.txt"
                  aria-label="Upload architecture file"
                  disabled={isAnalyzing}
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-3">
                        {getFileIcon(selectedFile)}
                        <div className="text-left">
                          <div className="font-semibold text-foreground">{selectedFile.name}</div>
                          <div className="text-sm text-foreground-muted">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isAnalyzing && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors underline"
                      >
                        Remove file and select another
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-foreground-muted" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Upload Architecture File
                      </h3>
                      <p className="text-foreground-muted">
                        Drag and drop your file here, or click to browse
                      </p>
                      <div className="inline-flex items-center space-x-2 text-sm text-foreground-muted bg-muted px-4 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Supports: Images, Terraform, YAML, JSON, XML files (max 25MB)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            {selectedFile && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-appId" className="block text-sm font-medium text-foreground mb-2">
                      Application ID <span className="text-primary">*</span>
                    </label>
                    <input
                      id="modal-appId"
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="e.g., app-prod-001, web-service-v2"
                      className="input-base"
                      disabled={isAnalyzing}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="modal-componentName" className="block text-sm font-medium text-foreground mb-2">
                      Component Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="modal-componentName"
                      type="text"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      placeholder="e.g., Payment Service, User Management"
                      className="input-base"
                      disabled={isAnalyzing}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="modal-environment" className="block text-sm font-medium text-foreground mb-2">
                      Environment
                    </label>
                    <select
                      id="modal-environment"
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="input-base"
                      disabled={isAnalyzing}
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="modal-version" className="block text-sm font-medium text-foreground mb-2">
                      Version
                    </label>
                    <input
                      id="modal-version"
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="e.g., v1.2.3, 2024.01"
                      className="input-base"
                      disabled={isAnalyzing}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="modal-description" className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      id="modal-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the application purpose, business function, or technical details..."
                      rows={3}
                      className="input-base resize-none"
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-error-light border border-error/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-error" />
                  </div>
                  <div>
                    <div className="font-medium text-error mb-1">Analysis Error</div>
                    <p className="text-error/80 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <div className="text-sm text-foreground-muted">
              {selectedFile && appId.trim() && componentName.trim() 
                ? "Ready to analyze your architecture"
                : "Please upload a file and fill in the required details"
              }
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isAnalyzing}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || !appId.trim() || !componentName.trim() || isAnalyzing}
                className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Analysis Options Modal */}
      <AnalysisOptionsModal
        isOpen={showAnalysisOptions}
        onClose={() => setShowAnalysisOptions(false)}
        onConfirm={handleAnalysisOptionsConfirm}
      />
    </>
  );
}
