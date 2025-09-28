"use client";

import { useState, useCallback } from "react";
import { Upload, FileImage, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { AnalysisProgress, AnalysisRequest, ComplianceFramework } from "@/types/architecture";

interface FileUploadProps {
  onAnalysisStart: (progress: AnalysisProgress) => void;
  onAnalysisComplete: (results: unknown) => void;
  progress: AnalysisProgress | null;
}

export function FileUpload({ onAnalysisStart, onAnalysisComplete, progress }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata form fields
  const [appId, setAppId] = useState("");
  const [componentName, setComponentName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [version, setVersion] = useState("");

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedTextTypes = ['text/plain', 'application/json', 'text/yaml', 'text/yml'];
    const allowedIacTypes = ['application/x-yaml', 'text/x-yaml', 'application/xml', 'text/xml'];

    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    const isImage = allowedImageTypes.includes(file.type);
    const isText = allowedTextTypes.includes(file.type) || allowedIacTypes.includes(file.type);
    const isIacFile = file.name.endsWith('.tf') || file.name.endsWith('.yaml') || 
                     file.name.endsWith('.yml') || file.name.endsWith('.json') ||
                     file.name.endsWith('.xml');

    if (!isImage && !isText && !isIacFile) {
      return "Please upload an image file (PNG, JPG, GIF, WebP) or Infrastructure as Code file (Terraform, YAML, JSON, XML)";
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const request: AnalysisRequest = {
      file: selectedFile,
      metadata: {
        appId: appId.trim() || undefined,
        componentName: componentName.trim() || undefined,
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

    // Start analysis
    onAnalysisStart({
      stage: "uploading",
      progress: 0,
      message: "Uploading file..."
    });

    try {
      await performAnalysis(request);
    } catch (error) {
      onAnalysisStart({
        stage: "error",
        progress: 0,
        message: "Analysis failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const performAnalysis = async (request: AnalysisRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('metadata', JSON.stringify(request.metadata));
    formData.append('options', JSON.stringify(request.analysisOptions));

    // Update progress
    onAnalysisStart({
      stage: "processing",
      progress: 20,
      message: "Processing file..."
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      onAnalysisStart({
        stage: "analyzing",
        progress: 50,
        message: "Analyzing architecture..."
      });

      const results = await response.json();

      onAnalysisStart({
        stage: "generating",
        progress: 80,
        message: "Generating report..."
      });

      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 500));

      onAnalysisComplete(results);
    } catch (error) {
      throw error;
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-primary" />;
    }
    return <FileText className="w-8 h-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (progress && progress.stage !== "complete" && progress.stage !== "error") {
    return (
      <div className="bg-surface border border-border rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {progress.message}
        </h3>
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary to-primary-active h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-foreground-muted">
          <span className="font-medium">{progress.progress}% complete</span>
          <span>•</span>
          <span>Processing your architecture...</span>
        </div>
      </div>
    );
  }

  if (progress && progress.stage === "error") {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl shadow-sm p-6 text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <h3 className="text-xl font-semibold text-error mb-3">
          Analysis Failed
        </h3>
        <p className="text-error/80 mb-6 max-w-md mx-auto">
          {progress.error || "An unexpected error occurred during the analysis. Please try again or contact support if the issue persists."}
        </p>
        <button
          onClick={() => {
            setSelectedFile(null);
            setError(null);
            onAnalysisStart({
              stage: "uploading",
              progress: 0,
              message: "Ready to analyze"
            });
          }}
          className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
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
        />
        
        {selectedFile ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3">
                {getFileIcon(selectedFile)}
                <div className="text-left">
                  <div className="font-semibold text-foreground text-lg">{selectedFile.name}</div>
                  <div className="text-sm text-foreground-muted">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-foreground-muted hover:text-foreground transition-colors underline"
            >
              Remove file and select another
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-10 h-10 text-foreground-muted" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">
                Upload Architecture File
              </h3>
              <p className="text-lg text-foreground-muted max-w-md mx-auto">
                Drag and drop your file here, or click to browse
              </p>
              <div className="inline-flex items-center space-x-2 text-sm text-foreground-muted bg-muted px-4 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Supports: Images, Terraform, YAML, JSON, XML files</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error-light border border-error/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-error" />
            </div>
            <div>
              <div className="font-medium text-error mb-1">Upload Error</div>
              <p className="text-error/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Form */}
      {selectedFile && !error && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Application Information</span>
          </h3>
          <p className="text-sm text-foreground-muted mb-6">
            Provide additional context about your application and component for more accurate analysis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="appId" className="block text-sm font-medium text-foreground">
                Application ID <span className="text-primary">*</span>
              </label>
              <input
                id="appId"
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g., app-prod-001, web-service-v2"
                className="input-base"
                required
              />
              <p className="text-xs text-foreground-muted">Unique identifier for your application or service</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="componentName" className="block text-sm font-medium text-foreground">
                Component Name <span className="text-primary">*</span>
              </label>
              <input
                id="componentName"
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., Payment Service, User Management"
                className="input-base"
                required
              />
              <p className="text-xs text-foreground-muted">Name of the specific component or module</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="environment" className="block text-sm font-medium text-foreground">
                Environment
              </label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="input-base"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="sandbox">Sandbox</option>
              </select>
              <p className="text-xs text-foreground-muted">Deployment environment for this architecture</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="version" className="block text-sm font-medium text-foreground">
                Version
              </label>
              <input
                id="version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., v1.2.3, 2024.01"
                className="input-base"
              />
              <p className="text-xs text-foreground-muted">Current version of the application or component</p>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the application purpose, business function, or technical details..."
                rows={3}
                className="input-base resize-none"
              />
              <p className="text-xs text-foreground-muted">Additional context about the application or component functionality</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedFile && !error && (
        <div className="text-center">
          <button
            onClick={handleAnalyze}
            disabled={!appId.trim() || !componentName.trim()}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 mx-auto"
          >
            <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <span>Analyze Architecture</span>
          </button>
          <p className="text-sm text-foreground-muted mt-3">
            {!appId.trim() || !componentName.trim() 
              ? "Please fill in the required fields (Application ID and Component Name) to continue"
              : "This will analyze your architecture for security, compliance, and cost optimization"
            }
          </p>
        </div>
      )}
    </div>
  );
}
