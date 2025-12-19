"use client";

import { useState } from "react";
import { 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  CheckCircle,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  Code,
  Search,
  Brain,
  Loader2,
  BookOpen,
  Image as ImageIcon,
  Maximize2,
  X,
  ExternalLink,
  FileDown
} from "lucide-react";
import { ArchitectureAnalysis, RiskLevel } from "@/types/architecture";
import BlueprintInsights from "./BlueprintInsights";
import { ConvertToBlueprintModal } from "./ConvertToBlueprintModal";
import { InteractiveDiagramViewer } from "./InteractiveDiagramViewer";

interface AnalysisResultsProps {
  results: ArchitectureAnalysis;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ results, onNewAnalysis }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'security' | 'resiliency' | 'cost' | 'risks' | 'recommendations' | 'json' | 'terraform' | 'search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searching, setSearching] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const downloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await fetch(`/api/analysis/${results.id}/pdf`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate PDF' }));
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `architecture-analysis-${results.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-analysis-${results.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateTerraformCode = (): string => {
    const lines: string[] = [];
    
    // Determine primary cloud provider
    const primaryProvider = results.metadata?.primaryCloudProvider || 
                           (results.components?.[0]?.cloudProvider) || 
                           'aws';
    
    // Add provider configuration
    lines.push(`# Terraform configuration for ${results.componentName || 'Architecture'}`);
    lines.push(`# Generated from ArchLens analysis: ${results.id}`);
    lines.push(`# Primary Cloud Provider: ${primaryProvider}`);
    lines.push('');
    
    // Add provider blocks
    if (primaryProvider === 'aws' || primaryProvider === 'AWS') {
      lines.push('terraform {');
      lines.push('  required_version = ">= 1.0"');
      lines.push('  required_providers {');
      lines.push('    aws = {');
      lines.push('      source  = "hashicorp/aws"');
      lines.push('      version = "~> 5.0"');
      lines.push('    }');
      lines.push('  }');
      lines.push('}');
      lines.push('');
      lines.push('provider "aws" {');
      lines.push(`  region = "${results.components?.[0]?.cloudRegion || 'us-east-1'}"`);
      lines.push('}');
      lines.push('');
    } else if (primaryProvider === 'azure' || primaryProvider === 'Azure') {
      lines.push('terraform {');
      lines.push('  required_version = ">= 1.0"');
      lines.push('  required_providers {');
      lines.push('    azurerm = {');
      lines.push('      source  = "hashicorp/azurerm"');
      lines.push('      version = "~> 3.0"');
      lines.push('    }');
      lines.push('  }');
      lines.push('}');
      lines.push('');
      lines.push('provider "azurerm" {');
      lines.push('  features {}');
      lines.push('}');
      lines.push('');
    } else if (primaryProvider === 'gcp' || primaryProvider === 'GCP') {
      lines.push('terraform {');
      lines.push('  required_version = ">= 1.0"');
      lines.push('  required_providers {');
      lines.push('    google = {');
      lines.push('      source  = "hashicorp/google"');
      lines.push('      version = "~> 5.0"');
      lines.push('    }');
      lines.push('  }');
      lines.push('}');
      lines.push('');
      lines.push('provider "google" {');
      lines.push(`  project = "your-project-id"`);
      lines.push(`  region  = "${results.components?.[0]?.cloudRegion || 'us-central1'}"`);
      lines.push('}');
      lines.push('');
    }

    // Group components by Terraform category
    const componentsByCategory = (results.components || []).reduce((acc: Record<string, any[]>, comp: any) => {
      const category = comp.terraformCategory || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(comp);
      return acc;
    }, {});

    // Generate resources by category
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      lines.push(`# ${category}`);
      lines.push('');
      
      components.forEach((comp: any, idx: number) => {
        const resourceName = comp.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `resource_${idx}`;
        const provider = comp.cloudProvider?.toLowerCase() || primaryProvider.toLowerCase();
        
        // Generate resource based on component type and provider
        if (provider === 'aws') {
          lines.push(`# ${comp.name || 'Component'} - ${comp.type || 'unknown'}`);
          if (comp.type === 'compute' || comp.type === 'service') {
            lines.push(`resource "aws_instance" "${resourceName}" {`);
            lines.push(`  ami           = "ami-12345678"  # Update with appropriate AMI`);
            lines.push(`  instance_type = "${comp.configuration?.instanceType || 't3.micro'}"`);
            if (comp.cloudRegion) {
              lines.push(`  availability_zone = "${comp.cloudRegion}"`);
            }
            lines.push(`  tags = {`);
            lines.push(`    Name        = "${comp.name || resourceName}"`);
            lines.push(`    Component   = "${comp.type || 'unknown'}"`);
            lines.push(`    Category    = "${category}"`);
            if (comp.description) {
              lines.push(`    Description = "${comp.description}"`);
            }
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'database') {
            lines.push(`resource "aws_db_instance" "${resourceName}" {`);
            lines.push(`  identifier     = "${resourceName}"`);
            lines.push(`  engine         = "postgres"  # Update based on actual database type`);
            lines.push(`  instance_class = "db.t3.micro"`);
            lines.push(`  allocated_storage = 20`);
            lines.push(`  tags = {`);
            lines.push(`    Name        = "${comp.name || resourceName}"`);
            lines.push(`    Component   = "${comp.type || 'unknown'}"`);
            lines.push(`    Category    = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'storage') {
            lines.push(`resource "aws_s3_bucket" "${resourceName}" {`);
            lines.push(`  bucket = "${resourceName}-${Date.now()}"`);
            lines.push(`  tags = {`);
            lines.push(`    Name        = "${comp.name || resourceName}"`);
            lines.push(`    Component   = "${comp.type || 'unknown'}"`);
            lines.push(`    Category    = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'network' || comp.type === 'gateway') {
            lines.push(`resource "aws_vpc" "${resourceName}" {`);
            lines.push(`  cidr_block = "10.0.0.0/16"`);
            lines.push(`  tags = {`);
            lines.push(`    Name        = "${comp.name || resourceName}"`);
            lines.push(`    Component   = "${comp.type || 'unknown'}"`);
            lines.push(`    Category    = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else {
            // Generic resource
            lines.push(`# TODO: Add Terraform resource for ${comp.type}`);
            lines.push(`# Component: ${comp.name || resourceName}`);
            lines.push(`# Type: ${comp.type || 'unknown'}`);
            lines.push(`# Category: ${category}`);
            if (comp.cloudService) {
              lines.push(`# Cloud Service: ${comp.cloudService}`);
            }
            lines.push('');
          }
        } else if (provider === 'azure') {
          lines.push(`# ${comp.name || 'Component'} - ${comp.type || 'unknown'}`);
          if (comp.type === 'compute' || comp.type === 'service') {
            lines.push(`resource "azurerm_linux_virtual_machine" "${resourceName}" {`);
            lines.push(`  name                = "${resourceName}"`);
            lines.push(`  resource_group_name = azurerm_resource_group.main.name`);
            lines.push(`  location            = "${comp.cloudRegion || 'eastus'}"`);
            lines.push(`  size                = "${comp.configuration?.instanceType || 'Standard_B1s'}"`);
            lines.push(`  tags = {`);
            lines.push(`    Component = "${comp.type || 'unknown'}"`);
            lines.push(`    Category  = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'database') {
            lines.push(`resource "azurerm_postgresql_server" "${resourceName}" {`);
            lines.push(`  name                = "${resourceName}"`);
            lines.push(`  resource_group_name = azurerm_resource_group.main.name`);
            lines.push(`  location            = "${comp.cloudRegion || 'eastus'}"`);
            lines.push(`  sku_name            = "B_Gen5_2"`);
            lines.push(`  tags = {`);
            lines.push(`    Component = "${comp.type || 'unknown'}"`);
            lines.push(`    Category  = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'storage') {
            lines.push(`resource "azurerm_storage_account" "${resourceName}" {`);
            lines.push(`  name                     = "${resourceName.replace(/_/g, '')}"`);
            lines.push(`  resource_group_name      = azurerm_resource_group.main.name`);
            lines.push(`  location                 = "${comp.cloudRegion || 'eastus'}"`);
            lines.push(`  account_tier             = "Standard"`);
            lines.push(`  account_replication_type = "LRS"`);
            lines.push(`  tags = {`);
            lines.push(`    Component = "${comp.type || 'unknown'}"`);
            lines.push(`    Category  = "${category}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else {
            lines.push(`# TODO: Add Terraform resource for ${comp.type}`);
            lines.push(`# Component: ${comp.name || resourceName}`);
            lines.push(`# Type: ${comp.type || 'unknown'}`);
            lines.push(`# Category: ${category}`);
            lines.push('');
          }
        } else if (provider === 'gcp') {
          lines.push(`# ${comp.name || 'Component'} - ${comp.type || 'unknown'}`);
          if (comp.type === 'compute' || comp.type === 'service') {
            lines.push(`resource "google_compute_instance" "${resourceName}" {`);
            lines.push(`  name         = "${resourceName}"`);
            lines.push(`  machine_type = "${comp.configuration?.instanceType || 'e2-micro'}"`);
            lines.push(`  zone         = "${comp.cloudRegion || 'us-central1-a'}"`);
            lines.push(`  labels = {`);
            lines.push(`    component = "${comp.type || 'unknown'}"`);
            lines.push(`    category  = "${category.replace(/\s+/g, '-').toLowerCase()}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'database') {
            lines.push(`resource "google_sql_database_instance" "${resourceName}" {`);
            lines.push(`  name             = "${resourceName}"`);
            lines.push(`  database_version = "POSTGRES_14"`);
            lines.push(`  region           = "${comp.cloudRegion || 'us-central1'}"`);
            lines.push(`  settings {`);
            lines.push(`    tier = "db-f1-micro"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else if (comp.type === 'storage') {
            lines.push(`resource "google_storage_bucket" "${resourceName}" {`);
            lines.push(`  name     = "${resourceName}-${Date.now()}"`);
            lines.push(`  location = "${comp.cloudRegion || 'US'}"`);
            lines.push(`  labels = {`);
            lines.push(`    component = "${comp.type || 'unknown'}"`);
            lines.push(`    category  = "${category.replace(/\s+/g, '-').toLowerCase()}"`);
            lines.push(`  }`);
            lines.push(`}`);
          } else {
            lines.push(`# TODO: Add Terraform resource for ${comp.type}`);
            lines.push(`# Component: ${comp.name || resourceName}`);
            lines.push(`# Type: ${comp.type || 'unknown'}`);
            lines.push(`# Category: ${category}`);
            lines.push('');
          }
        } else {
          lines.push(`# TODO: Add Terraform resource for ${comp.type}`);
          lines.push(`# Component: ${comp.name || resourceName}`);
          lines.push(`# Type: ${comp.type || 'unknown'}`);
          lines.push(`# Provider: ${provider}`);
          lines.push(`# Category: ${category}`);
          lines.push('');
        }
        lines.push('');
      });
    });

    // Add outputs section
    lines.push('# Outputs');
    lines.push('output "architecture_id" {');
    lines.push(`  value = "${results.id}"`);
    lines.push('  description = "ArchLens analysis ID"');
    lines.push('}');
    lines.push('');
    lines.push('output "component_count" {');
    lines.push(`  value = ${results.components?.length || 0}`);
    lines.push('  description = "Number of components in the architecture"');
    lines.push('}');

    return lines.join('\n');
  };

  const downloadTerraform = () => {
    const terraformCode = generateTerraformCode();
    const dataBlob = new Blob([terraformCode], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-${results.id}.tf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchAnswer('');
    try {
      const response = await fetch(`/api/analysis/${results.id}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchAnswer(data.answer);
      } else {
        setSearchAnswer('Failed to process query. Please try again.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchAnswer('An error occurred while processing your query.');
    } finally {
      setSearching(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel | string) => {
    const levelStr = typeof level === 'string' ? level.toLowerCase() : level;
    switch (levelStr) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'components', label: 'Components', icon: Target },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'resiliency', label: 'Resiliency', icon: CheckCircle },
    { id: 'cost', label: 'Cost Efficiency', icon: DollarSign },
    { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'json', label: 'JSON Export', icon: FileText },
    { id: 'terraform', label: 'Terraform Export', icon: Code },
    { id: 'search', label: 'AI Search', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-hover to-primary"></div>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-6 lg:space-y-0">
          <div className="space-y-5 flex-1">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                <h2 className="text-4xl font-bold text-foreground tracking-tight">Analysis Results</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-success-light/50 rounded-lg border border-success/20">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="font-semibold text-foreground">{results.fileName}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-secondary rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{new Date(results.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-secondary rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium">Processed with {(results.llmProvider || 'unknown').toString().toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            {/* Application Metadata */}
            {(results.appId || results.componentName || results.environment || results.version || results.processingTime) && (
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50 backdrop-blur-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {results.appId && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">App ID</div>
                      <div className="text-lg font-bold text-foreground bg-surface px-3 py-2 rounded-lg border border-border/50">{results.appId}</div>
                    </div>
                  )}
                  {results.componentName && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Component</div>
                      <div className="text-lg font-bold text-foreground bg-surface px-3 py-2 rounded-lg border border-border/50">{results.componentName}</div>
                    </div>
                  )}
                  {results.environment && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Environment</div>
                      <div className="text-lg font-bold text-foreground">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                          results.environment === 'production' ? 'bg-error-light text-error border-2 border-error/30' :
                          results.environment === 'staging' ? 'bg-warning-light text-warning border-2 border-warning/30' :
                          'bg-info-light text-info border-2 border-info/30'
                        }`}>
                          {(results.environment || 'unknown').toString().charAt(0).toUpperCase() + (results.environment || 'unknown').toString().slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
                  {results.version && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Version</div>
                      <div className="text-lg font-bold text-foreground font-mono bg-surface px-3 py-2 rounded-lg border border-border/50">{results.version}</div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Processing Time</div>
                    <div className="text-lg font-bold text-foreground bg-surface px-3 py-2 rounded-lg border border-border/50">{results.processingTime}s</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:ml-6">
            <button
              onClick={downloadPDF}
              disabled={downloadingPDF}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5 active:scale-95"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowConvertModal(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3 border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary rounded-xl transition-all duration-300 text-sm font-semibold hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Convert to Blueprint</span>
            </button>
            <button
              onClick={onNewAnalysis}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl group-hover:bg-success/10 transition-colors duration-300"></div>
          <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Security</span>
              <div className="text-xs text-foreground-muted">Vulnerability Assessment</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.securityScore)}`}>
              {results.securityScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.securityScore >= 80 ? 'bg-success' :
                results.securityScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.securityScore}%` }}
            ></div>
          </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-3xl group-hover:bg-info/10 transition-colors duration-300"></div>
          <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-info" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Resiliency</span>
              <div className="text-xs text-foreground-muted">Fault Tolerance</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.resiliencyScore)}`}>
              {results.resiliencyScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.resiliencyScore >= 80 ? 'bg-success' :
                results.resiliencyScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.resiliencyScore}%` }}
            ></div>
          </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-3xl group-hover:bg-warning/10 transition-colors duration-300"></div>
          <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Cost Efficiency</span>
              <div className="text-xs text-foreground-muted">Resource Optimization</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.costEfficiencyScore)}`}>
              {results.costEfficiencyScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.costEfficiencyScore >= 80 ? 'bg-success' :
                results.costEfficiencyScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.costEfficiencyScore}%` }}
            ></div>
          </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-300"></div>
          <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Compliance</span>
              <div className="text-xs text-foreground-muted">Regulatory Standards</div>
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(results.complianceScore)}`}>
              {results.complianceScore}
            </div>
            <div className="text-sm text-foreground-muted mb-1">/100</div>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                results.complianceScore >= 80 ? 'bg-success' :
                results.complianceScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${results.complianceScore}%` }}
            ></div>
          </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-sm">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'components' | 'security' | 'resiliency' | 'cost' | 'risks' | 'recommendations' | 'json' | 'terraform' | 'search')}
                className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground-muted hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover rounded-xl opacity-90"></span>
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary-foreground' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Image Preview - Show if file is an image */}
            {results.fileType === 'image' && (results.originalFile || results.id) && (
              <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Architecture Diagram
                  </h3>
                  {results.id && (
                    <a
                      href={`/api/analysis/${results.id}/file`}
                      download={results.fileName}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
                <div className="relative bg-muted rounded-lg overflow-hidden border border-border" style={{ minHeight: '600px' }}>
                  {results.originalFile?.data ? (
                    <InteractiveDiagramViewer
                      imageUrl={`data:${results.originalFile.mimeType || 'image/png'};base64,${results.originalFile.data}`}
                      imageAlt={results.fileName || 'Architecture diagram'}
                      components={(results.components || []).map((comp: any) => ({
                        name: comp.name || comp.id || 'Unknown',
                        type: (comp.type || 'service') as any,
                        technology: comp.technology || comp.cloudService || '',
                        criticality: (comp.criticality || 'medium') as any,
                        dependencies: comp.dependencies || [],
                        scalability: (comp.scalability || 'both') as any,
                        securityLevel: (comp.securityLevel || 'medium') as any,
                        costImpact: (comp.costImpact || 'medium') as any,
                        performanceCharacteristics: comp.performanceCharacteristics || {
                          latency: 'medium' as const,
                          throughput: 'medium' as const,
                          availability: 99
                        },
                        description: comp.description || ''
                      }))}
                      connections={(results.connections || []).map((conn: any) => ({
                        source: conn.source || conn.from || conn.sourceComponent || '',
                        target: conn.target || conn.to || conn.targetComponent || '',
                        type: conn.type || conn.connectionType || '',
                        protocol: conn.protocol || '',
                        description: conn.description || ''
                      })).filter((conn: any) => conn.source && conn.target)}
                      onComponentClick={(component) => {
                        console.log('Component clicked:', component);
                        setActiveTab('components');
                      }}
                      className="h-[600px]"
                    />
                  ) : results.id ? (
                    <InteractiveDiagramViewer
                      imageUrl={`/api/analysis/${results.id}/file`}
                      imageAlt={results.fileName || 'Architecture diagram'}
                      components={(results.components || []).map((comp: any) => ({
                        name: comp.name || comp.id || 'Unknown',
                        type: (comp.type || 'service') as any,
                        technology: comp.technology || comp.cloudService || '',
                        criticality: (comp.criticality || 'medium') as any,
                        dependencies: comp.dependencies || [],
                        scalability: (comp.scalability || 'both') as any,
                        securityLevel: (comp.securityLevel || 'medium') as any,
                        costImpact: (comp.costImpact || 'medium') as any,
                        performanceCharacteristics: comp.performanceCharacteristics || {
                          latency: 'medium' as const,
                          throughput: 'medium' as const,
                          availability: 99
                        },
                        description: comp.description || ''
                      }))}
                      connections={(results.connections || []).map((conn: any) => ({
                        source: conn.source || conn.from || conn.sourceComponent || '',
                        target: conn.target || conn.to || conn.targetComponent || '',
                        type: conn.type || conn.connectionType || '',
                        protocol: conn.protocol || '',
                        description: conn.description || ''
                      })).filter((conn: any) => conn.source && conn.target)}
                      onComponentClick={(component) => {
                        console.log('Component clicked:', component);
                        setActiveTab('components');
                      }}
                      className="h-[600px]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-foreground-muted">
                      <p>No diagram available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Components Tab */}
          {activeTab === 'components' && (
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Architecture Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(results.components || []).map((comp: any, idx: number) => (
                      <div key={comp.id || idx} className="bg-secondary rounded-lg p-4 border border-border hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{comp.name || comp.id || 'Unknown Component'}</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-foreground-muted">Type:</span>
                            <span className="ml-2 text-foreground">{comp.type || 'N/A'}</span>
                          </div>
                          {comp.cloudProvider && (
                            <div>
                              <span className="text-foreground-muted">Provider:</span>
                              <span className="ml-2 text-foreground">{comp.cloudProvider}</span>
                            </div>
                          )}
                          {comp.cloudService && (
                            <div>
                              <span className="text-foreground-muted">Service:</span>
                              <span className="ml-2 text-foreground">{comp.cloudService}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
