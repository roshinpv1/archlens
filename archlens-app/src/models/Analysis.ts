import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the Analysis document
export interface IAnalysis extends Document {
  _id: string;
  timestamp: Date;
  fileName: string;
  fileType: 'image' | 'iac' | 'text';
  
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
  
  // Analysis Results - Use any[] to match Mixed schema
  components: any[];
  connections: any[];
  
  risks: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    category: string;
    impact: string;
    recommendation: string;
    components: string[];
  }>;
  
  complianceGaps: Array<{
    id: string;
    framework: string;
    requirement: string;
    description: string;
    severity: string;
    remediation: string;
    components: string[];
  }>;
  
  costIssues: Array<{
    id: string;
    title: string;
    description: string;
    estimatedSavingsUSD: number;
    recommendation: string;
    components: string[];
    severity: string;
  }>;
  
  // Scores
  resiliencyScore: number;
  securityScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
  
  recommendations: Array<{
    id: string;
    issue: string;
    fix: string;
    impact: string;
    effort: string;
    priority: number;
    category: string;
  }>;
  
  estimatedSavingsUSD: number;
  summary: string;
  architectureDescription: string;
  processingTime: number;
  llmProvider: string;
  llmModel: string;
  
  // Additional metadata
  createdBy?: string;
  tags?: string[];
  status: 'completed' | 'processing' | 'failed';
}

// Define the schema
const AnalysisSchema = new Schema<IAnalysis>({
  timestamp: { type: Date, default: Date.now, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'iac', 'text'], required: true },
  
  // File Storage
  originalFile: {
    name: { type: String },
    size: { type: Number },
    type: { type: String },
    data: { type: String }, // Base64 encoded file data
    mimeType: { type: String }
  },
  
  // Application Metadata
  appId: { type: String },
  componentName: { type: String },
  description: { type: String },
  environment: { type: String },
  version: { type: String },
  
  // Analysis Results - Use Mixed types to bypass casting issues
  components: [Schema.Types.Mixed],
  connections: [Schema.Types.Mixed],
  
  risks: [{
    id: String,
    title: String,
    description: String,
    severity: String,
    category: String,
    impact: String,
    recommendation: String,
    components: [String]
  }],
  
  complianceGaps: [{
    id: String,
    framework: String,
    requirement: String,
    description: String,
    severity: String,
    remediation: String,
    components: [String]
  }],
  
  costIssues: [{
    id: String,
    title: String,
    description: String,
    estimatedSavingsUSD: Number,
    recommendation: String,
    components: [String],
    severity: String
  }],
  
  // Scores
  resiliencyScore: { type: Number, min: 0, max: 100 },
  securityScore: { type: Number, min: 0, max: 100 },
  costEfficiencyScore: { type: Number, min: 0, max: 100 },
  complianceScore: { type: Number, min: 0, max: 100 },
  
  recommendations: [{
    id: String,
    issue: String,
    fix: String,
    impact: String,
    effort: String,
    priority: Number,
    category: String
  }],
  
  estimatedSavingsUSD: { type: Number, default: 0 },
  summary: { type: String, required: true },
  architectureDescription: { type: String, required: true },
  processingTime: { type: Number, required: true },
  llmProvider: { type: String, required: true },
  llmModel: { type: String, required: true },
  
  // Additional metadata
  createdBy: { type: String },
  tags: [{ type: String }],
  status: { type: String, enum: ['completed', 'processing', 'failed'], default: 'completed' }
}, {
  timestamps: true,
  collection: 'analyses'
});

// Create indexes for better query performance
AnalysisSchema.index({ timestamp: -1 });
AnalysisSchema.index({ appId: 1 });
AnalysisSchema.index({ environment: 1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ 'createdBy': 1 });

// Export the model
let Analysis: Model<IAnalysis>;

try {
  // Try to retrieve the existing model
  Analysis = mongoose.model<IAnalysis>('Analysis');
} catch {
  // If the model doesn't exist, create it
  Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
}

export default Analysis;
