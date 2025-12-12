import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlueprint extends Document {
  id: string;
  name: string;
  description: string;
  creatorDescription?: string; // Additional details and context provided by the blueprint creator
  type: 'architecture' | 'iac' | 'template';
  category: 'e-commerce' | 'devops' | 'web-development' | 'data-science' | 'mobile' | 'ai-ml' | 'security' | 'infrastructure';
  tags: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  // Original file storage (for viewing/downloading)
  originalFile?: {
    name: string;
    size: number;
    type: string;
    data: string; // Base64 encoded file data
    mimeType: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
  downloadCount: number;
  rating: number;
  version: string;
  cloudProviders: string[];
  complexity: 'low' | 'medium' | 'high';
  metadata: {
    components: number;
    connections: number;
    estimatedCost: number;
    deploymentTime: string;
    // Additional architecture metadata
    architectureType?: string;
    hybridCloudModel?: string;
    primaryCloudProvider?: string;
    primaryPurpose?: string;
    environmentType?: string;
    deploymentModel?: string;
    // Extracted components and connections (full objects)
    extractedComponents?: any[];
    extractedConnections?: any[];
  };
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

const BlueprintSchema = new Schema<IBlueprint>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  creatorDescription: { type: String }, // Additional details from creator
  type: { 
    type: String, 
    required: true, 
    enum: ['architecture', 'iac', 'template'] 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['E-commerce', 'DevOps', 'Web Development', 'Data Analytics', 'IoT', 'Mobile', 'AI/ML', 'Security', 'Other'] 
  },
  tags: [{ type: String }],
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  // Original file storage
  originalFile: {
    name: { type: String },
    size: { type: Number },
    type: { type: String },
    data: { type: String }, // Base64 encoded file data
    mimeType: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  version: { type: String, default: '1.0.0' },
  cloudProviders: [{ type: String }],
  complexity: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'] 
  },
  metadata: {
    components: { type: Number, default: 0 },
    connections: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    deploymentTime: { type: String, default: 'Unknown' },
    // Additional architecture metadata
    architectureType: { type: String },
    hybridCloudModel: { type: String },
    primaryCloudProvider: { type: String },
    primaryPurpose: { type: String },
    environmentType: { type: String },
    deploymentModel: { type: String },
    // Extracted components and connections (full objects)
    extractedComponents: [{ type: Schema.Types.Mixed }],
    extractedConnections: [{ type: Schema.Types.Mixed }]
  },
  // Embedding-related fields
  embeddingId: { type: String },
  hasEmbedding: { type: Boolean, default: false },
  embeddingGeneratedAt: { type: Date },
  // Analysis-related fields
  hasAnalysis: { type: Boolean, default: false },
  lastAnalysisId: { type: String },
  lastAnalysisDate: { type: Date },
  analysisScores: {
    security: { type: Number, default: 0 },
    resiliency: { type: Number, default: 0 },
    costEfficiency: { type: Number, default: 0 },
    compliance: { type: Number, default: 0 },
    scalability: { type: Number, default: 0 },
    maintainability: { type: Number, default: 0 }
  },
  componentCount: { type: Number, default: 0 },
  architecturePatterns: [{ type: String }],
  technologyStack: [{ type: String }]
}, {
  timestamps: true,
  collection: 'blueprints'
});

// Indexes for better performance
BlueprintSchema.index({ name: 'text', description: 'text', tags: 'text' });
BlueprintSchema.index({ type: 1 });
BlueprintSchema.index({ category: 1 });
BlueprintSchema.index({ complexity: 1 });
BlueprintSchema.index({ cloudProviders: 1 });
BlueprintSchema.index({ createdAt: -1 });
BlueprintSchema.index({ downloadCount: -1 });
BlueprintSchema.index({ rating: -1 });
BlueprintSchema.index({ hasEmbedding: 1 });
BlueprintSchema.index({ hasAnalysis: 1 });
BlueprintSchema.index({ 'analysisScores.security': -1 });
BlueprintSchema.index({ 'analysisScores.resiliency': -1 });
BlueprintSchema.index({ componentCount: -1 });

let Blueprint: Model<IBlueprint>;

try {
  Blueprint = mongoose.model<IBlueprint>('Blueprint');
} catch {
  Blueprint = mongoose.model<IBlueprint>('Blueprint', BlueprintSchema);
}

export default Blueprint;
