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
  GENERIC = "generic"
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
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ComponentConnection {
  id: string;
  source: string; // Component ID
  target: string; // Component ID
  type: ConnectionType;
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

export interface ArchitectureAnalysis {
  id: string;
  timestamp: Date;
  fileName: string;
  fileType: "image" | "iac" | "text";
  
  // Application Metadata
  appId?: string;
  componentName?: string;
  description?: string;
  environment?: string;
  version?: string;
  
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
