/**
 * Architecture Analysis Types
 * Core types for cloud architecture review system
 */

export enum ComponentType {
  COMPUTE = "compute",
  STORAGE = "storage", 
  DATABASE = "database",
  NETWORKING = "networking",
  SECURITY = "security",
  IAM = "iam",
  MONITORING = "monitoring",
  OTHER = "other"
}

export enum CloudProvider {
  AWS = "aws",
  AZURE = "azure",
  GCP = "gcp",
  ON_PREMISES = "on-premises",
  KUBERNETES = "kubernetes",
  MULTI_CLOUD = "multi-cloud",
  GENERIC = "generic"
}

export enum HybridCloudModel {
  SINGLE_CLOUD = "single-cloud",
  MULTI_CLOUD = "multi-cloud",
  HYBRID_CLOUD = "hybrid-cloud",
  ON_PREMISES_ONLY = "on-premises-only"
}

export enum DeploymentModel {
  PUBLIC_CLOUD = "public-cloud",
  PRIVATE_CLOUD = "private-cloud",
  HYBRID_CLOUD = "hybrid-cloud",
  MULTI_CLOUD = "multi-cloud",
  EDGE_COMPUTING = "edge-computing"
}

export enum ConnectionType {
  QUERY = "query",
  FILE_UPLOAD = "file_upload",
  API_CALL = "api_call",
  DATA_SYNC = "data_sync",
  LOAD_BALANCE = "load_balance",
  CACHE = "cache",
  MESSAGE_QUEUE = "message_queue",
  OTHER = "other"
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical"
}

export enum ComplianceFramework {
  CIS = "cis",
  PCI_DSS = "pci_dss",
  HIPAA = "hipaa",
  GDPR = "gdpr",
  SOC2 = "soc2",
  ISO27001 = "iso27001"
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: ComponentType;
  cloudService?: string;
  cloudProvider?: CloudProvider;
  cloudRegion?: string;
  cloudAvailabilityZone?: string;
  isManagedService?: boolean;
  isServerless?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ComponentConnection {
  id: string;
  source: string; // Component ID
  target: string; // Component ID
  type: ConnectionType;
  protocol?: string;
  port?: number;
  crossCloud?: boolean;
  crossRegion?: boolean;
  isPrivate?: boolean;
  description?: string;
  direction?: "inbound" | "outbound" | "bidirectional";
  metadata?: Record<string, unknown>;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: "security" | "reliability" | "performance" | "cost" | "compliance";
  affectedComponents: string[];
  recommendations: string[];
}

export interface ComplianceGap {
  id: string;
  framework: ComplianceFramework;
  requirement: string;
  description: string;
  severity: RiskLevel;
  affectedComponents: string[];
  remediation: string;
}

export interface CostIssue {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  currency: string;
  affectedComponents: string[];
  recommendations: string[];
}

export interface Recommendation {
  id: string;
  issue: string;
  fix: string;
  impact: RiskLevel;
  effort: "low" | "medium" | "high";
  priority: number;
  category: "security" | "reliability" | "performance" | "cost" | "compliance";
}

export interface ArchitectureMetadata {
  architectureType: "microservices" | "monolith" | "serverless" | "hybrid" | "multi-cloud";
  cloudProviders: CloudProvider[];
  hybridCloudModel: HybridCloudModel;
  primaryCloudProvider: CloudProvider | "multi-cloud";
  estimatedComplexity: "low" | "medium" | "high";
  primaryPurpose: "web application" | "api" | "data processing" | "ml-ai" | "iot" | "other";
  environmentType: "development" | "staging" | "production";
  deploymentModel: DeploymentModel;
}

export interface ArchitectureAnalysis {
  id: string;
  timestamp: Date;
  fileName: string;
  fileType: "image" | "iac" | "text";
  
  // File Storage
  originalFile?: {
    name: string;
    size: number;
    type: string;
    data: string; // Base64 encoded file data
    mimeType: string;
  };
  
  // Application Metadata
  appId?: string;
  componentName?: string;
  description?: string;
  environment?: string;
  version?: string;
  
  // Architecture Metadata
  metadata?: ArchitectureMetadata;
  
  // Core Analysis
  components: ArchitectureComponent[];
  connections: ComponentConnection[];
  
  // Risk Assessment
  risks: Risk[];
  complianceGaps: ComplianceGap[];
  costIssues: CostIssue[];
  
  // Scoring
  resiliencyScore: number;
  securityScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
  
  // Recommendations
  recommendations: Recommendation[];
  estimatedSavingsUSD: number;
  
  // Human-readable summary
  summary: string;
  architectureDescription: string;
  
  // Metadata
  processingTime: number;
  llmProvider: string;
  llmModel: string;
  
  // Blueprint Insights (optional)
  similarBlueprints?: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    cloudProvider: string;
    complexity: string;
    tags: string[];
    score: number;
  }>;
  
  blueprintInsights?: Array<{
    blueprintId: string;
    blueprintName: string;
    similarityScore: number;
    insights: string[];
    recommendations: string[];
  }>;
}

export interface AnalysisRequest {
  file: File;
  metadata?: {
    appId?: string;
    componentName?: string;
    description?: string;
    environment?: string;
    version?: string;
  };
  analysisOptions?: {
    includeCostAnalysis?: boolean;
    includeComplianceCheck?: boolean;
    frameworks?: ComplianceFramework[];
    focusAreas?: string[];
  };
}

export interface AnalysisProgress {
  stage: "uploading" | "processing" | "analyzing" | "generating" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  error?: string;
}
