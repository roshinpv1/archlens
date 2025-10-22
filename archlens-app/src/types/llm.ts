/**
 * Additional LLM types for the application
 */

import { LLMClient } from "../../llm-client";
import { 
  ArchitectureComponent, 
  ComponentConnection, 
  Risk, 
  ComplianceGap, 
  CostIssue, 
  Recommendation 
} from './architecture';

export interface LLMClientInterface {
  callLLM(prompt: string, options?: { timeout?: number }): Promise<string>;
  getConfig(): {
    provider: string;
    model: string;
    available?: boolean;
  };
  isAvailable(): boolean;
}

export interface AnalysisOptions {
  includeCostAnalysis?: boolean;
  includeComplianceCheck?: boolean;
  frameworks?: string[];
  focusAreas?: string[];
}

export interface LLMResponseData {
  components?: ArchitectureComponent[];
  connections?: ComponentConnection[];
  risks?: Risk[];
  complianceGaps?: ComplianceGap[];
  costIssues?: CostIssue[];
  // Scores can be at root level or nested under scores
  resiliencyScore?: number;
  securityScore?: number;
  costEfficiencyScore?: number;
  complianceScore?: number;
  scores?: {
    resiliencyScore?: number;
    securityScore?: number;
    costEfficiencyScore?: number;
    complianceScore?: number;
  };
  recommendations?: Recommendation[];
  estimatedSavingsUSD?: number;
  summary?: string;
  architectureDescription?: string;
}

export type LLMClientType = LLMClient;
