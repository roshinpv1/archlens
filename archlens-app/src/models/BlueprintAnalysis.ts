import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlueprintAnalysis extends Document {
  blueprintId: string;
  analysisId: string;
  components: Array<{
    name: string;
    type: string;
    terraformCategory?: string;
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
  risks: Array<{
    id?: string;
    title?: string;
    name?: string;
    description: string;
    severity?: string;
    level?: string;
    category?: string;
    impact?: string;
    recommendation?: string;
    recommendations?: string[];
    components?: string[];
  }>;
  complianceGaps: Array<{
    id?: string;
    framework: string;
    requirement: string;
    description: string;
    severity?: string;
    remediation: string;
    components?: string[];
  }>;
  costIssues: Array<{
    id?: string;
    title: string;
    description: string;
    category?: string;
    estimatedSavingsUSD?: number;
    estimatedSavings?: number;
    recommendation: string;
    components?: string[];
    severity?: string;
  }>;
  recommendations: Array<{
    component?: string;
    issue: string;
    recommendation?: string;
    fix?: string;
    priority?: string | number;
    impact?: string;
    effort?: string;
    sourceBlueprint?: string;
    confidence?: number;
    category?: string;
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
    enum: [
      'database', 'api', 'service', 'storage', 'network', 'security', 'monitoring', 
      'cache', 'queue', 'gateway', 'compute', 'user', 'backup', 'load-balancer', 
      'cdn', 'firewall', 'vpn', 'dns', 'identity', 'authentication', 'authorization',
      'logging', 'analytics', 'messaging', 'event-bus', 'workflow', 'scheduler',
      'container', 'orchestration', 'registry', 'build', 'deployment', 'testing',
      'documentation', 'utility', 'other'
    ]
  },
  terraformCategory: {
    type: String,
    enum: [
      'Foundational Services / Landing Zones',
      'Foundational Services / Networking',
      'Foundational Services / Storage',
      'Identity & Access Management',
      'Policy',
      'Observability',
      'Data Protection',
      'Platform Services / Compute',
      'Platform Services / Middleware Integration',
      'Platform Services / Database',
      'Platform Services / Analytics AI-ML',
      'Platform Services / Miscellaneous'
    ]
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

const RiskSchema = new Schema({
  id: { type: String },
  title: { type: String },
  name: { type: String },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low']
  },
  level: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low']
  },
  category: { type: String },
  impact: { type: String },
  recommendation: { type: String },
  recommendations: [{ type: String }],
  components: [{ type: String }]
}, { _id: false });

const ComplianceGapSchema = new Schema({
  id: { type: String },
  framework: { type: String, required: true },
  requirement: { type: String, required: true },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low']
  },
  remediation: { type: String, required: true },
  components: [{ type: String }]
}, { _id: false });

const CostIssueSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  estimatedSavingsUSD: { type: Number },
  estimatedSavings: { type: Number },
  recommendation: { type: String, required: true },
  components: [{ type: String }],
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low']
  }
}, { _id: false });

const RecommendationSchema = new Schema({
  component: { type: String },
  issue: { type: String, required: true },
  recommendation: { type: String },
  fix: { type: String },
  priority: { 
    type: Schema.Types.Mixed, // Can be string or number
  },
  impact: { 
    type: String, 
    enum: ['high', 'medium', 'low']
  },
  effort: { 
    type: String, 
    enum: ['high', 'medium', 'low']
  },
  sourceBlueprint: { type: String },
  confidence: { type: Number, min: 0, max: 1 },
  category: { type: String }
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
  risks: [RiskSchema],
  complianceGaps: [ComplianceGapSchema],
  costIssues: [CostIssueSchema],
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
