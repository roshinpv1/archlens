"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Image, File, Eye } from "lucide-react";
import { IAnalysis } from "@/models/Analysis";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: IAnalysis | null;
}

export function FilePreviewModal({ isOpen, onClose, analysis }: FilePreviewModalProps) {
  const [fileData, setFileData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && analysis?.originalFile) {
      setFileData(analysis.originalFile.data);
      setError(null);
    } else {
      setFileData(null);
    }
  }, [isOpen, analysis]);

  const handleDownload = async () => {
    if (!analysis) return;
    
    try {
      const response = await fetch(`/api/analysis/${analysis._id}/file`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = analysis.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'iac':
        return <FileText className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileContent = () => {
    if (!fileData || !analysis) return null;

    if (analysis.fileType === 'image') {
      return (
        <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
          <img
            src={`data:${analysis.originalFile?.mimeType};base64,${fileData}`}
            alt={analysis.fileName}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    } else if (analysis.fileType === 'iac' || analysis.fileType === 'text') {
      try {
        const textContent = atob(fileData);
        return (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{textContent}</pre>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-center text-red-500 py-8">
            Failed to decode file content
          </div>
        );
      }
    }

    return (
      <div className="text-center text-gray-500 py-8">
        File type not supported for preview
      </div>
    );
  };

  if (!isOpen || !analysis) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getFileIcon(analysis.fileType)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {analysis.fileName}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{analysis.fileType.toUpperCase()} File</span>
                {analysis.originalFile && (
                  <span>{formatFileSize(analysis.originalFile.size)}</span>
                )}
                <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          ) : (
            renderFileContent()
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Analysis ID: {analysis._id}</span>
              {analysis.appId && <span>App: {analysis.appId}</span>}
              {analysis.environment && <span>Env: {analysis.environment}</span>}
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>File Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
