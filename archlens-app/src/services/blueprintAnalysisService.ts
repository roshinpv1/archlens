/**
 * Blueprint Analysis Service
 * Handles blueprint analysis with component-centric approach
 */

import { createLLMClientFromEnv } from '../lib/llm-factory';
import { getEmbeddingService } from './embeddingService';
import { getSimilarityService } from './similarityService';
import { 
  ComponentAnalysis, 
  BlueprintComponentAnalysis, 
  ComponentRecommendation,
  SimilarBlueprint,
  BlueprintRecommendation,
  ComponentSimilarityMatrix
} from '../types/componentAnalysis';
import { Blueprint } from '../types/blueprint';

export class BlueprintAnalysisService {
  private llmClient = createLLMClientFromEnv();

  /**
   * Analyze a blueprint with component focus
   */
  async analyzeBlueprint(
    blueprint: Blueprint, 
    extractedComponents?: any[], 
    extractedConnections?: any[]
  ): Promise<BlueprintComponentAnalysis> {
    try {
      console.log(`🔍 Starting blueprint analysis for: ${blueprint.name}`);
      
      if (!this.llmClient) {
        throw new Error('LLM Client is not initialized');
      }
      
      // Generate analysis prompt with component focus (include extracted data if available)
      const analysisPrompt = this.generateBlueprintAnalysisPrompt(blueprint, extractedComponents, extractedConnections);
      
      // Call LLM for analysis
      const analysisResult = await this.llmClient.callLLM(analysisPrompt, {
        temperature: 0.3,
        maxTokens: 4000
      });
      
      // Parse and structure the analysis
      const parsedAnalysis = this.parseAnalysisResult(analysisResult, blueprint.id);
      
      // Generate and store analysis embeddings for similarity search
      await this.storeAnalysisEmbeddings(parsedAnalysis, blueprint);
      
      console.log(`✅ Blueprint analysis completed for: ${blueprint.name}`);
      return parsedAnalysis;
      
    } catch (error) {
      console.error('❌ Blueprint analysis failed:', error);
      throw new Error(`Blueprint analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store analysis embeddings in Qdrant for similarity search
   */
  private async storeAnalysisEmbeddings(analysis: BlueprintComponentAnalysis, blueprint: Blueprint): Promise<void> {
    try {
      console.log(`🔄 Generating analysis embeddings for blueprint: ${blueprint.name}`);
      
      const embeddingService = getEmbeddingService();
      const similarityService = getSimilarityService();
      
      // Create analysis content for embedding
      const analysisContent = this.createAnalysisContentForEmbedding(analysis, blueprint);
      
      // Generate embedding
      const embeddingResult = await embeddingService.generateEmbeddingFromText(analysisContent);
      
      if (!embeddingResult.success || !embeddingResult.embedding) {
        throw new Error(embeddingResult.error || 'Failed to generate embedding');
      }
      
      const embedding = embeddingResult.embedding;
      
      // Store in Qdrant with analysis-specific metadata
      const analysisPointId = `analysis_${analysis.analysisId}`;
      const metadata = {
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        analysisId: analysis.analysisId,
        type: 'blueprint_analysis',
        componentCount: analysis.components.length,
        architecturePatterns: analysis.architecturePatterns,
        technologyStack: analysis.technologyStack,
        scores: analysis.scores,
        createdAt: analysis.createdAt.toISOString(),
        // Component-specific metadata for better similarity matching
        componentTypes: analysis.components.map(c => c.type),
        componentTechnologies: analysis.components.map(c => c.technology),
        criticalComponents: analysis.components.filter(c => c.criticality === 'high').map(c => c.name),
        scalabilityPatterns: analysis.components.map(c => c.scalability),
        securityLevels: analysis.components.map(c => c.securityLevel)
      };
      
      await similarityService.storeEmbedding(analysisPointId, embedding, metadata);
      console.log(`✅ Analysis embeddings stored in Qdrant: ${analysisPointId}`);
      
    } catch (error) {
      console.error('❌ Failed to store analysis embeddings:', error);
      // Don't fail the analysis if embedding storage fails
    }
  }

  /**
   * Create analysis content optimized for embedding generation
   */
  private createAnalysisContentForEmbedding(analysis: BlueprintComponentAnalysis, blueprint: Blueprint): string {
    const components = analysis.components.map(c => 
      `${c.name} (${c.type}): ${c.technology} - ${c.criticality} criticality, ${c.scalability} scalability, ${c.securityLevel} security`
    ).join('; ');
    
    const relationships = analysis.componentRelationships.map(r => 
      `${r.source} ${r.relationship} ${r.target}`
    ).join('; ');
    
    const patterns = analysis.architecturePatterns.join(', ');
    const technologies = analysis.technologyStack.join(', ');
    const insights = analysis.insights.join('; ');
    const recommendations = analysis.recommendations.map(r => 
      `${r.component || 'General'}: ${r.issue} - ${r.recommendation}`
    ).join('; ');
    
    return `
Blueprint: ${blueprint.name} (${blueprint.type})
Description: ${blueprint.description}
Category: ${blueprint.category}
Complexity: ${blueprint.complexity}
Cloud Providers: ${blueprint.cloudProviders.join(', ')}

Components: ${components}
Relationships: ${relationships}
Architecture Patterns: ${patterns}
Technology Stack: ${technologies}
Insights: ${insights}
Recommendations: ${recommendations}

Scores: Security ${analysis.scores.security}, Resiliency ${analysis.scores.resiliency}, 
Cost Efficiency ${analysis.scores.costEfficiency}, Compliance ${analysis.scores.compliance}, 
Scalability ${analysis.scores.scalability}, Maintainability ${analysis.scores.maintainability}
    `.trim();
  }

  /**
   * Find similar blueprints based on component analysis
   */
  async findSimilarBlueprints(
    analysis: BlueprintComponentAnalysis, 
    threshold: number = 0.7
  ): Promise<SimilarBlueprint[]> {
    try {
      console.log(`🔍 Finding similar blueprints for analysis: ${analysis.analysisId}`);
      
      if (!this.llmClient) {
        throw new Error('LLM Client is not initialized');
      }
      
      // Generate component-based similarity search
      const similarityPrompt = this.generateSimilarityMatchingPrompt(analysis);
      
      // Call LLM for similarity analysis
      const similarityResult = await this.llmClient.callLLM(similarityPrompt, {
        temperature: 0.2,
        maxTokens: 3000
      });
      
      // Parse similarity results
      const similarBlueprints = this.parseSimilarityResult(similarityResult);
      
      // Filter by threshold
      const filteredResults = similarBlueprints.filter(bp => bp.similarityScore >= threshold);
      
      console.log(`✅ Found ${filteredResults.length} similar blueprints`);
      return filteredResults;
      
    } catch (error) {
      console.error('❌ Similarity search failed:', error);
      throw new Error(`Similarity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate component-based recommendations
   */
  async generateComponentRecommendations(
    analysis: BlueprintComponentAnalysis,
    similarBlueprints: SimilarBlueprint[]
  ): Promise<BlueprintRecommendation[]> {
    try {
      console.log(`💡 Generating component recommendations for: ${analysis.blueprintId}`);
      
      const recommendations: BlueprintRecommendation[] = [];
      
      // Analyze each similar blueprint for recommendations
      for (const similarBlueprint of similarBlueprints) {
        const blueprintRecommendations = await this.analyzeBlueprintForRecommendations(
          analysis,
          similarBlueprint
        );
        recommendations.push(...blueprintRecommendations);
      }
      
      // Sort by confidence and remove duplicates
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
      
      console.log(`✅ Generated ${uniqueRecommendations.length} component recommendations`);
      return uniqueRecommendations;
      
    } catch (error) {
      console.error('❌ Recommendation generation failed:', error);
      throw new Error(`Recommendation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate component similarity matrix
   */
  calculateComponentSimilarity(
    components1: ComponentAnalysis[], 
    components2: ComponentAnalysis[]
  ): ComponentSimilarityMatrix {
    const similarityMatrix = {
      exactMatches: 0,
      technologyMatches: 0,
      patternMatches: 0,
      complexityMatches: 0
    };
    
    // Calculate component-level similarity
    components1.forEach(comp1 => {
      components2.forEach(comp2 => {
        if (comp1.type === comp2.type) similarityMatrix.exactMatches++;
        if (comp1.technology === comp2.technology) similarityMatrix.technologyMatches++;
        if (comp1.criticality === comp2.criticality) similarityMatrix.complexityMatches++;
      });
    });
    
    const totalComparisons = components1.length * components2.length;
    const overallSimilarity = (
      (similarityMatrix.exactMatches * 0.4) +
      (similarityMatrix.technologyMatches * 0.3) +
      (similarityMatrix.complexityMatches * 0.3)
    ) / totalComparisons;
    
    return {
      ...similarityMatrix,
      overallSimilarity,
      componentMatches: this.findComponentMatches(components1, components2),
      recommendedComponents: this.suggestMissingComponents(components1, components2)
    };
  }

  /**
   * Generate blueprint analysis prompt with component focus
   */
  private generateBlueprintAnalysisPrompt(
    blueprint: Blueprint, 
    extractedComponents?: any[], 
    extractedConnections?: any[]
  ): string {
    // Format extracted components if available
    const extractedComponentsText = extractedComponents && extractedComponents.length > 0
      ? `\n**EXTRACTED COMPONENTS FROM BLUEPRINT FILE:**\n${JSON.stringify(extractedComponents, null, 2)}\n`
      : '';
    
    const extractedConnectionsText = extractedConnections && extractedConnections.length > 0
      ? `\n**EXTRACTED CONNECTIONS FROM BLUEPRINT FILE:**\n${JSON.stringify(extractedConnections, null, 2)}\n`
      : '';

    return `
Analyze this blueprint architecture and provide a comprehensive assessment focusing on components and their relationships.

**BLUEPRINT INFORMATION:**
- Name: ${blueprint.name}
- Description: ${blueprint.description}
- Type: ${blueprint.type}
- Category: ${blueprint.category}
- Complexity: ${blueprint.complexity}
- Cloud Providers: ${blueprint.cloudProviders.join(', ')}
- Tags: ${blueprint.tags.join(', ')}
${extractedComponentsText}
${extractedConnectionsText}

**COMPONENT ANALYSIS REQUIRED:**

1. **Core Components Identification:**
   - List all primary components (databases, APIs, services, storage, networking)
   - Identify component types (microservices, monoliths, serverless, containers)
   - Map component dependencies and data flow
   - Identify critical path components

2. **Component Architecture Assessment:**
   - Component coupling and cohesion analysis
   - Service boundaries and responsibilities
   - Data flow patterns between components
   - Component scalability characteristics
   - Fault tolerance and resilience patterns

3. **Technology Stack Analysis:**
   - Database technologies (SQL, NoSQL, caching)
   - Application frameworks and languages
   - Message queues and event streaming
   - API gateways and service mesh
   - Monitoring and observability tools

4. **Security Component Analysis:**
   - Authentication and authorization components
   - Network security boundaries
   - Data encryption and key management
   - Security monitoring and logging
   - Compliance and governance components

5. **Infrastructure Components:**
   - Load balancers and traffic management
   - CDN and content delivery
   - Storage and backup systems
   - Networking and connectivity
   - Container orchestration

**SCORING CRITERIA (0-100):**
- Security: Component-level security implementation
- Resiliency: Component fault tolerance and recovery
- Cost Efficiency: Resource optimization across components
- Compliance: Component adherence to standards
- Scalability: Component horizontal/vertical scaling capability
- Maintainability: Component complexity and modularity

**IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any explanatory text, markdown formatting, or additional commentary. Return ONLY the JSON object as specified below.**

**CRITICAL VALUES: Use ONLY these exact values:

TERRAFORM CATEGORIES (MUST classify each component into one of these):
1. "Foundational Services / Landing Zones" - Landing zones, account structures, organizational units
2. "Foundational Services / Networking" - VPCs, subnets, load balancers, CDN, DNS, VPN, peering, gateways
3. "Foundational Services / Storage" - Object storage, file storage, block storage, backup storage
4. "Identity & Access Management" - IAM roles, policies, users, groups, authentication, authorization, SSO
5. "Policy" - Resource policies, compliance policies, governance, guardrails, service control policies
6. "Observability" - Monitoring, logging, alerting, dashboards, metrics, tracing, APM tools
7. "Data Protection" - Encryption, key management, secrets management, backup, disaster recovery, data loss prevention
8. "Platform Services / Compute" - Virtual machines, containers, serverless functions, auto-scaling, compute instances
9. "Platform Services / Middleware Integration" - Message queues, event buses, API gateways, service mesh, integration platforms
10. "Platform Services / Database" - Relational databases, NoSQL databases, data warehouses, in-memory databases
11. "Platform Services / Analytics AI-ML" - Data analytics, machine learning, AI services, data processing, BI tools
12. "Platform Services / Miscellaneous" - Other platform services not fitting above categories

COMPONENT TYPES (use one of these):
"database", "api", "service", "storage", "network", "security", "monitoring", "cache", "queue", "gateway", 
"compute", "user", "backup", "load-balancer", "cdn", "firewall", "vpn", "dns", "identity", 
"authentication", "authorization", "logging", "analytics", "messaging", "event-bus", "workflow", 
"scheduler", "container", "orchestration", "registry", "build", "deployment", "testing", 
"documentation", "utility", "other"

OTHER VALUES:
- criticality: "high", "medium", or "low"
- scalability: "horizontal", "vertical", or "both"  
- securityLevel: "high", "medium", or "low"
- costImpact: "high", "medium", or "low"
- latency: "low", "medium", or "high"
- throughput: "low", "medium", or "high"
- relationship: "depends_on", "communicates_with", "scales_with", "load_balances", or "caches_for"
- priority: "high", "medium", or "low"**

**OUTPUT FORMAT (JSON):**
{
  "components": [
    {
      "name": "component_name",
      "type": "database|api|service|storage|network|security|monitoring|cache|queue|gateway|compute|user|backup|load-balancer|cdn|firewall|vpn|dns|identity|authentication|authorization|logging|analytics|messaging|event-bus|workflow|scheduler|container|orchestration|registry|build|deployment|testing|documentation|utility|other",
      "terraformCategory": "Foundational Services / Landing Zones|Foundational Services / Networking|Foundational Services / Storage|Identity & Access Management|Policy|Observability|Data Protection|Platform Services / Compute|Platform Services / Middleware Integration|Platform Services / Database|Platform Services / Analytics AI-ML|Platform Services / Miscellaneous",
      "technology": "specific_tech_stack",
      "criticality": "high|medium|low",
      "dependencies": ["component1", "component2"],
      "scalability": "horizontal|vertical|both",
      "securityLevel": "high|medium|low",
      "costImpact": "high|medium|low",
      "performanceCharacteristics": {
        "latency": "low|medium|high",
        "throughput": "low|medium|high", 
        "availability": 95
      },
      "description": "component_description",
      "responsibilities": ["responsibility1", "responsibility2"]
    }
  ],
  "componentRelationships": [
    {
      "source": "component1",
      "target": "component2",
      "relationship": "depends_on|communicates_with|scales_with|load_balances|caches_for",
      "strength": 0.8,
      "dataFlow": "description",
      "protocol": "HTTP|gRPC|message_queue"
    }
  ],
  "architecturePatterns": ["microservices", "event-driven", "api-gateway"],
  "technologyStack": ["aws", "kubernetes", "postgresql", "redis"],
  "componentComplexity": {
    "totalComponents": 12,
    "criticalComponents": 3,
    "highCouplingComponents": 2,
    "scalabilityBottlenecks": ["database", "api_gateway"],
    "integrationPoints": 8
  },
  "scores": {
    "security": 85,
    "resiliency": 78,
    "costEfficiency": 82,
    "compliance": 90,
    "scalability": 75,
    "maintainability": 80
  },
  "recommendations": [
    {
      "component": "component_name",
      "issue": "specific_issue",
      "recommendation": "improvement_suggestion",
      "priority": "high|medium|low",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "confidence": 0.85
    }
  ],
  "insights": [
    "Key architectural insight 1",
    "Key architectural insight 2"
  ],
  "bestPractices": [
    "Best practice 1",
    "Best practice 2"
  ],
  "industryStandards": [
    "Industry standard 1",
    "Industry standard 2"
  ]
}

**CRITICAL: Respond with ONLY the JSON object above. No additional text, explanations, or formatting.**
`;
  }

  /**
   * Generate similarity matching prompt
   */
  private generateSimilarityMatchingPrompt(analysis: BlueprintComponentAnalysis): string {
    const components = analysis.components.map(c => `${c.name} (${c.type}, ${c.technology})`).join(', ');
    const patterns = analysis.architecturePatterns.join(', ');
    const technologies = analysis.technologyStack.join(', ');
    
    return `
Find blueprints that share similar component architectures and technology patterns.

**CURRENT BLUEPRINT ANALYSIS:**
- Components: ${components}
- Architecture Patterns: ${patterns}
- Technology Stack: ${technologies}
- Complexity: ${analysis.componentComplexity.totalComponents} components, ${analysis.componentComplexity.criticalComponents} critical

**COMPONENT SIMILARITY CRITERIA:**

1. **Core Component Matching:**
   - Database components (SQL vs NoSQL, single vs distributed)
   - API and service layer patterns (REST, GraphQL, gRPC)
   - Message processing (synchronous vs asynchronous)
   - Storage patterns (object, block, file storage)
   - Caching strategies (in-memory, distributed, CDN)

2. **Architecture Pattern Similarity:**
   - Microservices vs monolith vs serverless
   - Event-driven vs request-response patterns
   - API gateway vs service mesh patterns
   - Database per service vs shared database
   - CQRS vs CRUD patterns

3. **Technology Stack Alignment:**
   - Cloud provider compatibility (AWS, Azure, GCP)
   - Container orchestration (Kubernetes, Docker Swarm)
   - Database technologies (PostgreSQL, MongoDB, Redis)
   - Programming languages and frameworks
   - Monitoring and observability tools

4. **Component Complexity Matching:**
   - Number of components (simple vs complex)
   - Component interaction complexity
   - Data flow complexity
   - Integration patterns complexity
   - Deployment complexity

**SIMILARITY SCORING:**
- Component Type Match (40%): Exact component type matches
- Technology Stack Match (25%): Shared technologies and frameworks
- Architecture Pattern Match (20%): Similar architectural approaches
- Complexity Level Match (10%): Comparable complexity levels
- Use Case Alignment (5%): Similar business domain components

**OUTPUT FORMAT (JSON):**
{
  "similar_blueprints": [
    {
      "blueprint_id": "blueprint_123",
      "similarity_score": 0.87,
      "component_matches": [
        {
          "component": "user_service",
          "match_type": "exact|similar|related",
          "confidence": 0.95,
          "source_component": "user_api",
          "target_component": "user_service"
        }
      ],
      "shared_technologies": ["kubernetes", "postgresql", "redis"],
      "architecture_patterns": ["microservices", "api-gateway"],
      "complexity_match": "high|medium|low",
      "use_case_alignment": "e-commerce"
    }
  ],
  "recommendations": [
    {
      "blueprint_id": "blueprint_456",
      "reason": "Similar component architecture with proven scalability",
      "applicable_components": ["load_balancer", "database_cluster"],
      "lessons_learned": ["Component optimization strategies", "Scaling patterns"],
      "implementation_guidance": "Step-by-step implementation guidance",
      "confidence": 0.85
    }
  ]
}
`;
  }

  /**
   * Parse analysis result from LLM response
   */
  private parseAnalysisResult(result: string, blueprintId: string): BlueprintComponentAnalysis {
    try {
      // Clean the result to handle markdown-wrapped JSON
      let cleanResult = result.trim();
      
      // Remove markdown code blocks if present
      if (cleanResult.startsWith('```json')) {
        cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResult.startsWith('```')) {
        cleanResult = cleanResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(cleanResult);
      
      return {
        blueprintId,
        analysisId: `analysis_${Date.now()}`,
        components: parsed.components || [],
        componentRelationships: parsed.componentRelationships || [],
        architecturePatterns: parsed.architecturePatterns || [],
        technologyStack: parsed.technologyStack || [],
        componentComplexity: parsed.componentComplexity || {
          totalComponents: 0,
          criticalComponents: 0,
          highCouplingComponents: 0,
          scalabilityBottlenecks: [],
          integrationPoints: 0
        },
        scores: parsed.scores || {
          security: 0,
          resiliency: 0,
          costEfficiency: 0,
          compliance: 0,
          scalability: 0,
          maintainability: 0
        },
        recommendations: parsed.recommendations || [],
        insights: parsed.insights || [],
        bestPractices: parsed.bestPractices || [],
        industryStandards: parsed.industryStandards || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to parse analysis result:', error);
      throw new Error('Invalid analysis result format');
    }
  }

  /**
   * Parse similarity result from LLM response
   */
  private parseSimilarityResult(result: string): SimilarBlueprint[] {
    try {
      const parsed = JSON.parse(result);
      return parsed.similar_blueprints || [];
    } catch (error) {
      console.error('❌ Failed to parse similarity result:', error);
      return [];
    }
  }

  /**
   * Analyze blueprint for recommendations
   */
  private async analyzeBlueprintForRecommendations(
    analysis: BlueprintComponentAnalysis,
    similarBlueprint: SimilarBlueprint
  ): Promise<BlueprintRecommendation[]> {
    // This would typically involve more sophisticated analysis
    // For now, return basic recommendations based on similarity
    return similarBlueprint.recommendations || [];
  }

  /**
   * Find component matches between two sets
   */
  private findComponentMatches(components1: ComponentAnalysis[], components2: ComponentAnalysis[]): any[] {
    const matches: any[] = [];
    
    components1.forEach(comp1 => {
      components2.forEach(comp2 => {
        if (comp1.type === comp2.type) {
          matches.push({
            component: comp1.name,
            matchType: 'exact',
            confidence: 0.9,
            sourceComponent: comp1.name,
            targetComponent: comp2.name
          });
        }
      });
    });
    
    return matches;
  }

  /**
   * Suggest missing components
   */
  private suggestMissingComponents(components1: ComponentAnalysis[], components2: ComponentAnalysis[]): string[] {
    const types1 = new Set(components1.map(c => c.type));
    const types2 = new Set(components2.map(c => c.type));
    
    const missing = Array.from(types2).filter(type => !types1.has(type));
    return missing;
  }

  /**
   * Deduplicate recommendations
   */
  private deduplicateRecommendations(recommendations: BlueprintRecommendation[]): BlueprintRecommendation[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = `${rec.blueprintId}-${rec.reason}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const blueprintAnalysisService = new BlueprintAnalysisService();
