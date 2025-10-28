import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlueprintAnalysis extends Document {
  blueprintId: string;
  analysisId: string;
  components: Array<{
    name: string;
    type: string;
    technology: string;
    criticality: string;
    dependencies: string[];
    scalability: string;
    securityLevel: string;
    costImpact: string;
    performanceCharacteristics: {
      latency: string;
      throughput: string;
      availability: number;
    };
    description?: string;
    responsibilities?: string[];
  }>;
  componentRelationships: Array<{
    source: string;
    target: string;
    relationship: string;
    strength: number;
    dataFlow?: string;
    protocol?: string;
  }>;
  architecturePatterns: string[];
  technologyStack: string[];
  componentComplexity: {
    totalComponents: number;
    criticalComponents: number;
    highCouplingComponents: number;
    scalabilityBottlenecks: string[];
    integrationPoints: number;
  };
  scores: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
    scalability: number;
    maintainability: number;
  };
  recommendations: Array<{
    component: string;
    issue: string;
    recommendation: string;
    priority: string;
    impact: string;
    effort: string;
    sourceBlueprint?: string;
    confidence: number;
  }>;
  insights: string[];
  bestPractices: string[];
  industryStandards: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['database', 'api', 'service', 'storage', 'network', 'security', 'monitoring', 'cache', 'queue', 'gateway']
  },
  technology: { type: String, required: true },
  criticality: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  dependencies: [{ type: String }],
  scalability: { 
    type: String, 
    required: true,
    enum: ['horizontal', 'vertical', 'both']
  },
  securityLevel: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  costImpact: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  performanceCharacteristics: {
    latency: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high']
    },
    throughput: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high']
    },
    availability: { type: Number, required: true, min: 0, max: 100 }
  },
  description: { type: String },
  responsibilities: [{ type: String }]
}, { _id: false });

const ComponentRelationshipSchema = new Schema({
  source: { type: String, required: true },
  target: { type: String, required: true },
  relationship: { 
    type: String, 
    required: true,
    enum: ['depends_on', 'communicates_with', 'scales_with', 'load_balances', 'caches_for']
  },
  strength: { type: Number, required: true, min: 0, max: 1 },
  dataFlow: { type: String },
  protocol: { type: String }
}, { _id: false });

const ComponentComplexitySchema = new Schema({
  totalComponents: { type: Number, required: true, min: 0 },
  criticalComponents: { type: Number, required: true, min: 0 },
  highCouplingComponents: { type: Number, required: true, min: 0 },
  scalabilityBottlenecks: [{ type: String }],
  integrationPoints: { type: Number, required: true, min: 0 }
}, { _id: false });

const ScoresSchema = new Schema({
  security: { type: Number, required: true, min: 0, max: 100 },
  resiliency: { type: Number, required: true, min: 0, max: 100 },
  costEfficiency: { type: Number, required: true, min: 0, max: 100 },
  compliance: { type: Number, required: true, min: 0, max: 100 },
  scalability: { type: Number, required: true, min: 0, max: 100 },
  maintainability: { type: Number, required: true, min: 0, max: 100 }
}, { _id: false });

const RecommendationSchema = new Schema({
  component: { type: String, required: true },
  issue: { type: String, required: true },
  recommendation: { type: String, required: true },
  priority: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  impact: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  effort: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low']
  },
  sourceBlueprint: { type: String },
  confidence: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const BlueprintAnalysisSchema = new Schema<IBlueprintAnalysis>({
  blueprintId: { type: String, required: true, unique: true },
  analysisId: { type: String, required: true, unique: true },
  components: [ComponentSchema],
  componentRelationships: [ComponentRelationshipSchema],
  architecturePatterns: [{ type: String }],
  technologyStack: [{ type: String }],
  componentComplexity: ComponentComplexitySchema,
  scores: ScoresSchema,
  recommendations: [RecommendationSchema],
  insights: [{ type: String }],
  bestPractices: [{ type: String }],
  industryStandards: [{ type: String }]
}, {
  timestamps: true,
  collection: 'blueprint_analyses'
});

// Indexes for better performance
BlueprintAnalysisSchema.index({ blueprintId: 1 });
BlueprintAnalysisSchema.index({ analysisId: 1 });
BlueprintAnalysisSchema.index({ 'scores.security': -1 });
BlueprintAnalysisSchema.index({ 'scores.resiliency': -1 });
BlueprintAnalysisSchema.index({ 'scores.costEfficiency': -1 });
BlueprintAnalysisSchema.index({ 'componentComplexity.totalComponents': 1 });
BlueprintAnalysisSchema.index({ architecturePatterns: 1 });
BlueprintAnalysisSchema.index({ technologyStack: 1 });
BlueprintAnalysisSchema.index({ createdAt: -1 });

let BlueprintAnalysis: Model<IBlueprintAnalysis>;

try {
  BlueprintAnalysis = mongoose.model<IBlueprintAnalysis>('BlueprintAnalysis');
} catch {
  BlueprintAnalysis = mongoose.model<IBlueprintAnalysis>('BlueprintAnalysis', BlueprintAnalysisSchema);
}

export default BlueprintAnalysis;
