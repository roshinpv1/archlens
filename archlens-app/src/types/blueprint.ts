/**
 * Blueprint Types
 * Types for blueprint management system
 */

export enum BlueprintType {
  ARCHITECTURE = "architecture",
  IAC = "iac",
  TEMPLATE = "template"
}

export enum BlueprintComplexity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export enum BlueprintCategory {
  E_COMMERCE = "E-commerce",
  DEVOPS = "DevOps",
  WEB_DEVELOPMENT = "Web Development",
  DATA_ANALYTICS = "Data Analytics",
  IOT = "IoT",
  MOBILE = "Mobile",
  AI_ML = "AI/ML",
  SECURITY = "Security",
  OTHER = "Other"
}

export interface BlueprintMetadata {
  components?: number;
  connections?: number;
  estimatedCost?: number;
  deploymentTime?: string;
  cloudProviders?: string[];
  tags?: string[];
  // Extracted architecture data
  architectureType?: string;
  hybridCloudModel?: string;
  primaryCloudProvider?: string;
  primaryPurpose?: string;
  environmentType?: string;
  deploymentModel?: string;
  // Extracted components and connections (full objects)
  extractedComponents?: any[];
  extractedConnections?: any[];
  // Image optimization info
  imageOptimization?: {
    original_size_kb: number;
    optimized_size_kb: number;
    compression_ratio: number;
    dimensions?: [number, number];
    fallback_used?: boolean;
  };
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  type: BlueprintType;
  category: BlueprintCategory;
  tags: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string; // Base64 encoded file data
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
  downloadCount: number;
  rating: number;
  version: string;
  cloudProviders: string[];
  complexity: BlueprintComplexity;
  metadata: BlueprintMetadata;
  // Embedding-related fields
  embeddingId?: string;
  hasEmbedding: boolean;
  embeddingGeneratedAt?: Date;
  // Analysis-related fields
  hasAnalysis: boolean;
  lastAnalysisId?: string;
  lastAnalysisDate?: Date;
  analysisScores?: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
    scalability: number;
    maintainability: number;
  };
  componentCount?: number;
  architecturePatterns?: string[];
  technologyStack?: string[];
}

export interface BlueprintUploadRequest {
  name: string;
  description: string;
  type: BlueprintType;
  category: BlueprintCategory;
  tags: string[];
  isPublic: boolean;
  complexity: BlueprintComplexity;
  cloudProviders: string[];
  estimatedCost?: number;
  deploymentTime?: string;
  file: File;
}

export interface BlueprintQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: BlueprintType;
  category?: BlueprintCategory;
  cloudProvider?: string;
  complexity?: BlueprintComplexity;
  isPublic?: boolean;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'downloadCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface BlueprintResponse {
  blueprints: Blueprint[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
