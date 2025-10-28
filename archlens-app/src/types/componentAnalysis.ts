/**
 * Component Analysis Types
 * Types for blueprint component analysis and similarity matching
 */

export interface ComponentAnalysis {
  name: string;
  type: 'database' | 'api' | 'service' | 'storage' | 'network' | 'security' | 'monitoring' | 'cache' | 'queue' | 'gateway';
  technology: string;
  criticality: 'high' | 'medium' | 'low';
  dependencies: string[];
  scalability: 'horizontal' | 'vertical' | 'both';
  securityLevel: 'high' | 'medium' | 'low';
  costImpact: 'high' | 'medium' | 'low';
  performanceCharacteristics: {
    latency: 'low' | 'medium' | 'high';
    throughput: 'low' | 'medium' | 'high';
    availability: number; // 0-100
  };
  description?: string;
  responsibilities?: string[];
}

export interface ComponentRelationship {
  source: string;
  target: string;
  relationship: 'depends_on' | 'communicates_with' | 'scales_with' | 'load_balances' | 'caches_for';
  strength: number; // 0-1
  dataFlow?: string;
  protocol?: string;
}

export interface BlueprintComponentAnalysis {
  blueprintId: string;
  analysisId: string;
  components: ComponentAnalysis[];
  componentRelationships: ComponentRelationship[];
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
  recommendations: ComponentRecommendation[];
  insights: string[];
  bestPractices: string[];
  industryStandards: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentRecommendation {
  component: string;
  issue: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  sourceBlueprint?: string;
  confidence: number; // 0-1
}

export interface SimilarBlueprint {
  blueprintId: string;
  similarityScore: number;
  componentMatches: ComponentMatch[];
  sharedTechnologies: string[];
  architecturePatterns: string[];
  complexityMatch: 'high' | 'medium' | 'low';
  useCaseAlignment: string;
  recommendations: BlueprintRecommendation[];
}

export interface ComponentMatch {
  component: string;
  matchType: 'exact' | 'similar' | 'related';
  confidence: number;
  sourceComponent: string;
  targetComponent: string;
}

export interface BlueprintRecommendation {
  blueprintId: string;
  reason: string;
  applicableComponents: string[];
  lessonsLearned: string[];
  implementationGuidance: string;
  confidence: number;
}

export interface ComponentSimilarityMatrix {
  exactMatches: number;
  technologyMatches: number;
  patternMatches: number;
  complexityMatches: number;
  overallSimilarity: number;
  componentMatches: ComponentMatch[];
  recommendedComponents: string[];
}

export interface BlueprintAnalysisRequest {
  blueprintId: string;
  includeComponentAnalysis?: boolean;
  includeSimilaritySearch?: boolean;
  similarityThreshold?: number;
}

export interface BlueprintAnalysisResponse {
  analysis: BlueprintComponentAnalysis;
  similarBlueprints: SimilarBlueprint[];
  recommendations: BlueprintRecommendation[];
  componentInsights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}
