import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlueprint extends Document {
  id: string;
  name: string;
  description: string;
  type: 'architecture' | 'iac' | 'template';
  category: 'e-commerce' | 'devops' | 'web-development' | 'data-science' | 'mobile' | 'ai-ml' | 'security' | 'infrastructure';
  tags: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
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
  };
  // Embedding-related fields
  embeddingId?: string;
  hasEmbedding: boolean;
  embeddingGeneratedAt?: Date;
}

const BlueprintSchema = new Schema<IBlueprint>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
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
    deploymentTime: { type: String, default: 'Unknown' }
  },
  // Embedding-related fields
  embeddingId: { type: String },
  hasEmbedding: { type: Boolean, default: false },
  embeddingGeneratedAt: { type: Date }
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

let Blueprint: Model<IBlueprint>;

try {
  Blueprint = mongoose.model<IBlueprint>('Blueprint');
} catch {
  Blueprint = mongoose.model<IBlueprint>('Blueprint', BlueprintSchema);
}

export default Blueprint;
