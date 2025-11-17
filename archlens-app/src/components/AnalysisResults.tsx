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
  Loader2
} from "lucide-react";
import { ArchitectureAnalysis, RiskLevel } from "@/types/architecture";
import BlueprintInsights from "./BlueprintInsights";

interface AnalysisResultsProps {
  results: ArchitectureAnalysis;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ results, onNewAnalysis }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'risks' | 'recommendations' | 'json' | 'terraform' | 'search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searching, setSearching] = useState(false);

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
    { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'json', label: 'JSON Export', icon: FileText },
    { id: 'terraform', label: 'Terraform Export', icon: Code },
    { id: 'search', label: 'AI Search', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Analysis Results</h2>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-foreground-muted">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="font-medium">{results.fileName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(results.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Processed with {(results.llmProvider || 'unknown').toString().toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            {/* Application Metadata */}
            {(results.appId || results.componentName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                {results.appId && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">App ID</div>
                    <div className="text-sm font-semibold text-foreground">{results.appId}</div>
                  </div>
                )}
                {results.componentName && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Component</div>
                    <div className="text-sm font-semibold text-foreground">{results.componentName}</div>
                  </div>
                )}
                {results.environment && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Environment</div>
                    <div className="text-sm font-semibold text-foreground">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        results.environment === 'production' ? 'bg-error-light text-error' :
                        results.environment === 'staging' ? 'bg-warning-light text-warning' :
                        'bg-info-light text-info'
                      }`}>
                        {(results.environment || 'unknown').toString().charAt(0).toUpperCase() + (results.environment || 'unknown').toString().slice(1)}
                      </span>
                    </div>
                  </div>
                )}
                {results.version && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Version</div>
                    <div className="text-sm font-semibold text-foreground font-mono">{results.version}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Processing Time</div>
                  <div className="text-sm font-semibold text-foreground">{results.processingTime}s</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={downloadJSON}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary hover:border-border-hover transition-all duration-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={onNewAnalysis}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
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

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
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

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
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

        <div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all">
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

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'components' | 'risks' | 'recommendations' | 'json')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Architecture Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                {results.summary}
              </p>
            </div>
            
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Architecture Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {results.architectureDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Key Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components Found:</span>
                    <span className="font-medium text-foreground">{results.components.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections:</span>
                    <span className="font-medium text-foreground">{results.connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risks Identified:</span>
                    <span className="font-medium text-foreground">{results.risks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommendations:</span>
                    <span className="font-medium text-foreground">{results.recommendations.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Potential Savings</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${results.estimatedSavingsUSD}
                  </div>
                  <p className="text-muted-foreground">Estimated monthly savings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.components.map((component) => (
                <div key={component.id} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{component.name}</h4>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {component.type}
                    </span>
                  </div>
                  {component.cloudService && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {component.cloudService}
                    </p>
                  )}
                  {component.description && (
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            {results.risks && Array.isArray(results.risks) ? (
              results.risks.map((risk) => (
                <div key={risk.id || `risk-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{risk.title || 'Unknown Risk'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(risk.level || 'medium')}`}>
                      {(risk.level || 'medium').toString().toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{risk.description || 'No description available'}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-foreground">Recommendations:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {risk.recommendations && Array.isArray(risk.recommendations) ? (
                        risk.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {typeof rec === 'string' ? rec : String(rec)}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No recommendations available</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No risks identified
              </div>
            )}

            {results.complianceGaps && Array.isArray(results.complianceGaps) && results.complianceGaps.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Gaps</h3>
                <div className="space-y-4">
                  {results.complianceGaps.map((gap) => (
                    <div key={gap.id || `gap-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{gap.requirement || 'Unknown Requirement'}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(gap.severity || 'medium')}`}>
                          {(gap.severity || 'medium').toString().toUpperCase()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{gap.description || 'No description available'}</p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-foreground">Remediation:</h5>
                        <p className="text-sm text-muted-foreground">{gap.remediation || 'No remediation provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {results.recommendations && Array.isArray(results.recommendations) ? (
              results.recommendations.map((rec) => (
                <div key={rec.id || `rec-${Math.random()}`} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{rec.issue || 'Unknown Issue'}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(rec.impact || 'medium')}`}>
                        {(rec.impact || 'medium').toString().toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                        {rec.effort || 'medium'} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{rec.fix || 'No fix provided'}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Priority: {rec.priority || 1}</span>
                    <span>Category: {rec.category || 'security'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recommendations available
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">JSON Export</h3>
              <button
                onClick={downloadJSON}
                className="flex items-center space-x-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm text-foreground">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'terraform' && (
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Terraform Export</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Terraform configuration generated from architecture analysis. Components are organized by Terraform category.
                </p>
              </div>
              <button
                onClick={downloadTerraform}
                className="flex items-center space-x-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                {generateTerraformCode()}
              </pre>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a generated Terraform configuration based on the architecture analysis. 
                You may need to:
              </p>
              <ul className="text-sm text-blue-800 mt-2 list-disc list-inside space-y-1">
                <li>Update provider configurations (regions, credentials, project IDs)</li>
                <li>Adjust resource configurations to match your requirements</li>
                <li>Add missing dependencies and relationships between resources</li>
                <li>Review and update instance types, AMIs, and other specific settings</li>
                <li>Add variables and modules for better organization</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-secondary rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Architecture Search
              </h3>
              <p className="text-sm text-foreground-muted">
                Ask questions about this architecture analysis and get intelligent answers based on components, risks, recommendations, and scores.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., What are the security risks? What components are critical? What are the cost optimization recommendations?"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchAnswer && (
              <div className="bg-muted rounded-lg p-6 border border-border">
                <div className="flex items-start gap-3 mb-4">
                  <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">Answer</h4>
                    <div className="text-foreground whitespace-pre-wrap">{searchAnswer}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Example Questions */}
            {!searchAnswer && (
              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Example Questions:</h4>
                <div className="space-y-2">
                  {[
                    "What are the security risks in this architecture?",
                    "Which components are most critical?",
                    "What are the cost optimization recommendations?",
                    "What compliance gaps exist?",
                    "What is the security score and what are the main concerns?",
                    "What are the top recommendations for improving this architecture?",
                    "Which components are in the networking category?",
                    "What are the resiliency concerns?"
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(question);
                        handleSearch();
                      }}
                      className="w-full text-left px-3 py-2 bg-surface hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blueprint Insights */}
      {results.blueprintInsights && results.blueprintInsights.length > 0 && (
        <BlueprintInsights insights={results.blueprintInsights} />
      )}
    </div>
  );
}
