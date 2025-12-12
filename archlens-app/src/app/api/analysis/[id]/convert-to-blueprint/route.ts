import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { getAnalysisById } from '@/services/analysisService';
import { getEmbeddingService } from '@/services/embeddingService';
import { getVectorStore } from '@/lib/vector-store';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';
import { BlueprintType, BlueprintCategory, BlueprintComplexity } from '@/types/blueprint';

/**
 * Convert an architecture analysis to a blueprint
 * POST /api/analysis/[id]/convert-to-blueprint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }

    // Get request body with additional blueprint details
    const body = await request.json();
    const {
      name,
      description,
      creatorDescription,
      category,
      tags = [],
      isPublic = true,
      complexity
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Fetch the analysis
    const analysis = await getAnalysisById(analysisId);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // analysis is already a plain object from getAnalysisById (using .lean())
    const analysisData = analysis;
    
    console.log(`🔄 Converting analysis ${analysisId} to blueprint: ${name}`);
    console.log(`📊 Analysis data structure:`, {
      hasRisks: !!analysisData.risks,
      risksCount: Array.isArray(analysisData.risks) ? analysisData.risks.length : 0,
      hasComplianceGaps: !!analysisData.complianceGaps,
      complianceGapsCount: Array.isArray(analysisData.complianceGaps) ? analysisData.complianceGaps.length : 0,
      hasCostIssues: !!analysisData.costIssues,
      costIssuesCount: Array.isArray(analysisData.costIssues) ? analysisData.costIssues.length : 0,
      hasRecommendations: !!analysisData.recommendations,
      recommendationsCount: Array.isArray(analysisData.recommendations) ? analysisData.recommendations.length : 0,
      risksSample: analysisData.risks?.[0] || null,
      complianceGapsSample: analysisData.complianceGaps?.[0] || null,
      costIssuesSample: analysisData.costIssues?.[0] || null,
      recommendationsSample: analysisData.recommendations?.[0] || null
    });

    // Determine blueprint type based on analysis file type
    let blueprintType: BlueprintType = BlueprintType.ARCHITECTURE;
    if (analysisData.fileType === 'iac') {
      blueprintType = BlueprintType.IAC;
    } else if (analysisData.fileType === 'text') {
      blueprintType = BlueprintType.TEMPLATE;
    }

    // Determine complexity if not provided
    const blueprintComplexity: BlueprintComplexity = complexity || 
      (analysisData.components?.length > 15 ? 'high' : 
       analysisData.components?.length > 8 ? 'medium' : 'low');

    // Extract cloud providers from analysis
    const cloudProviders: string[] = [];
    if (analysisData.components && Array.isArray(analysisData.components)) {
      analysisData.components.forEach((comp: any) => {
        if (comp.cloudProvider && comp.cloudProvider !== 'on-premises' && !cloudProviders.includes(comp.cloudProvider)) {
          cloudProviders.push(comp.cloudProvider);
        }
      });
    }

    // Create blueprint from analysis
    const newBlueprint = {
      id: Date.now().toString(),
      name,
      description,
      creatorDescription: creatorDescription || undefined,
      type: blueprintType,
      category: category as BlueprintCategory,
      tags: Array.isArray(tags) ? tags : [],
      fileName: analysisData.fileName || 'converted-from-analysis',
      fileSize: analysisData.originalFile?.size || 0,
      fileType: analysisData.fileType || 'image',
      fileUrl: `/uploads/blueprints/${Date.now()}-${analysisData.fileName || 'blueprint'}`,
      // Store original file data if available
      originalFile: analysisData.originalFile ? {
        name: analysisData.originalFile.name,
        size: analysisData.originalFile.size,
        type: analysisData.originalFile.type,
        data: analysisData.originalFile.data,
        mimeType: analysisData.originalFile.mimeType
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User', // This would come from auth context
      isPublic,
      downloadCount: 0,
      rating: 0,
      version: '1.0.0',
      cloudProviders: cloudProviders.length > 0 ? cloudProviders : ['unknown'],
      complexity: blueprintComplexity,
      metadata: {
        components: analysisData.components?.length || 0,
        connections: analysisData.connections?.length || 0,
        estimatedCost: 0,
        deploymentTime: 'Unknown',
        architectureType: (analysisData as any).architectureDescription || 'unknown',
        hybridCloudModel: cloudProviders.length > 1 ? 'multi-cloud' : 'single-cloud',
        primaryCloudProvider: cloudProviders[0] || 'unknown',
        primaryPurpose: description,
        environmentType: analysisData.environment || 'production',
        deploymentModel: 'public-cloud',
        // Store extracted components and connections
        extractedComponents: analysisData.components || [],
        extractedConnections: analysisData.connections || []
      },
      // Embedding-related fields
      embeddingId: undefined as string | undefined,
      hasEmbedding: false,
      embeddingGeneratedAt: undefined as Date | undefined,
      // Analysis-related fields
      hasAnalysis: false,
      lastAnalysisId: undefined as string | undefined,
      lastAnalysisDate: undefined as Date | undefined,
      analysisScores: undefined as {
        security: number;
        resiliency: number;
        costEfficiency: number;
        compliance: number;
        scalability: number;
        maintainability: number;
      } | undefined,
      componentCount: analysisData.components?.length || 0,
      architecturePatterns: undefined as string[] | undefined,
      technologyStack: cloudProviders
    };

    // Save blueprint to MongoDB
    const savedBlueprint = await Blueprint.create(newBlueprint);
    console.log(`✅ Blueprint created from analysis: ${savedBlueprint._id}`);

    // Generate and store blueprint embedding
    const embeddingService = getEmbeddingService();
    if (embeddingService.isAvailable()) {
      try {
        const enrichedBlueprint = {
          ...newBlueprint,
          extractedComponents: analysisData.components || [],
          extractedConnections: analysisData.connections || []
        };
        
        const embeddingResult = await embeddingService.processBlueprintEmbedding(enrichedBlueprint);
        
        if (embeddingResult.success) {
          await Blueprint.findOneAndUpdate(
            { id: newBlueprint.id },
            {
              embeddingId: embeddingResult.vectorId,
              hasEmbedding: true,
              embeddingGeneratedAt: new Date()
            }
          );
          console.log(`✅ Blueprint embedding generated: ${embeddingResult.vectorId}`);
        }
      } catch (embeddingError) {
        console.warn('⚠️ Failed to generate blueprint embedding:', embeddingError);
      }
    }

    // Create blueprint analysis from architecture analysis
    const blueprintAnalysis = {
      blueprintId: newBlueprint.id,
      analysisId: `blueprint_analysis_${Date.now()}`,
      components: analysisData.components || [],
      componentRelationships: (analysisData.connections || []).map((conn: any) => ({
        source: conn.source || conn.sourceId,
        target: conn.target || conn.targetId,
        relationship: conn.relationship || conn.type || 'communicates_with',
        strength: conn.strength || 0.8,
        dataFlow: conn.dataFlow || conn.description || '',
        protocol: conn.protocol || 'HTTP'
      })),
      architecturePatterns: [],
      technologyStack: cloudProviders,
      componentComplexity: {
        totalComponents: analysisData.components?.length || 0,
        criticalComponents: (analysisData.components || []).filter((c: any) => c.criticality === 'high').length,
        highCouplingComponents: 0,
        scalabilityBottlenecks: [],
        integrationPoints: analysisData.connections?.length || 0
      },
      scores: {
        security: analysisData.securityScore || 0,
        resiliency: analysisData.resiliencyScore || 0,
        costEfficiency: analysisData.costEfficiencyScore || 0,
        compliance: analysisData.complianceScore || 0,
        scalability: 75,
        maintainability: 80
      },
      // Map risks from architecture analysis format to blueprint analysis format
      risks: (analysisData.risks || []).map((risk: any) => ({
        id: risk.id,
        title: risk.title,
        name: risk.title, // Some risks might use 'name' instead of 'title'
        description: risk.description || '',
        severity: risk.severity || risk.level || 'medium',
        level: risk.level || risk.severity || 'medium',
        category: risk.category || 'security',
        impact: risk.impact || 'medium',
        recommendation: risk.recommendation || '',
        recommendations: risk.recommendations || [],
        components: risk.affectedComponents || risk.components || []
      })),
      // Map compliance gaps from architecture analysis format to blueprint analysis format
      complianceGaps: (analysisData.complianceGaps || []).map((gap: any) => ({
        id: gap.id,
        framework: gap.framework || 'Unknown',
        requirement: gap.requirement || '',
        description: gap.description || '',
        severity: gap.severity || 'medium',
        remediation: gap.remediation || '',
        components: gap.affectedComponents || gap.components || []
      })),
      // Map cost issues from architecture analysis format to blueprint analysis format
      costIssues: (analysisData.costIssues || []).map((issue: any) => ({
        id: issue.id,
        title: issue.title || '',
        description: issue.description || '',
        category: issue.category || 'cost',
        estimatedSavingsUSD: issue.estimatedSavingsUSD || issue.estimatedSavings || 0,
        estimatedSavings: issue.estimatedSavings || issue.estimatedSavingsUSD || 0,
        recommendation: issue.recommendation || '',
        components: issue.affectedComponents || issue.components || [],
        severity: issue.severity || 'medium'
      })),
      // Map recommendations from architecture analysis format to blueprint analysis format
      recommendations: (analysisData.recommendations || []).map((rec: any) => ({
        component: rec.component || 'General',
        issue: rec.issue || '',
        recommendation: rec.fix || rec.recommendation || '',
        fix: rec.fix || rec.recommendation || '',
        priority: rec.priority || 'medium',
        impact: rec.impact || 'medium',
        effort: rec.effort || 'medium',
        confidence: rec.confidence || 0.8,
        category: rec.category || 'security'
      })),
      insights: [],
      bestPractices: [],
      industryStandards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save blueprint analysis
    console.log(`💾 Saving blueprint analysis for ${newBlueprint.id}:`, {
      risksCount: blueprintAnalysis.risks?.length || 0,
      complianceGapsCount: blueprintAnalysis.complianceGaps?.length || 0,
      costIssuesCount: blueprintAnalysis.costIssues?.length || 0,
      recommendationsCount: blueprintAnalysis.recommendations?.length || 0,
      componentsCount: blueprintAnalysis.components?.length || 0
    });
    
    const savedBlueprintAnalysis = await BlueprintAnalysis.findOneAndUpdate(
      { blueprintId: newBlueprint.id },
      blueprintAnalysis,
      { upsert: true, new: true }
    );
    
    console.log(`✅ Blueprint analysis created: ${savedBlueprintAnalysis.analysisId}`);
    console.log(`📊 Analysis data saved and verified:`, {
      risks: savedBlueprintAnalysis.risks?.length || 0,
      complianceGaps: savedBlueprintAnalysis.complianceGaps?.length || 0,
      costIssues: savedBlueprintAnalysis.costIssues?.length || 0,
      recommendations: savedBlueprintAnalysis.recommendations?.length || 0,
      components: savedBlueprintAnalysis.components?.length || 0,
      hasRisks: Array.isArray(savedBlueprintAnalysis.risks) && savedBlueprintAnalysis.risks.length > 0,
      hasComplianceGaps: Array.isArray(savedBlueprintAnalysis.complianceGaps) && savedBlueprintAnalysis.complianceGaps.length > 0,
      hasCostIssues: Array.isArray(savedBlueprintAnalysis.costIssues) && savedBlueprintAnalysis.costIssues.length > 0,
      hasRecommendations: Array.isArray(savedBlueprintAnalysis.recommendations) && savedBlueprintAnalysis.recommendations.length > 0
    });

    // Generate and store blueprint analysis embedding
    if (embeddingService.isAvailable()) {
      try {
        const analysisEmbeddingResult = await embeddingService.generateAnalysisEmbedding({
          components: analysisData.components || [],
          connections: analysisData.connections || [],
          description: analysisData.summary || description,
          metadata: {
            architectureType: (analysisData as any).architectureDescription || 'unknown',
            cloudProviders: cloudProviders,
            estimatedComplexity: blueprintComplexity,
            primaryPurpose: description,
            environmentType: analysisData.environment || 'production'
          }
        });

        if (analysisEmbeddingResult.success && analysisEmbeddingResult.embedding) {
          const vectorStore = await getVectorStore();
          await vectorStore.initialize();
          const analysisPointId = `blueprint_analysis_${savedBlueprintAnalysis.analysisId}`;
          await vectorStore.storeEmbedding(analysisPointId, analysisEmbeddingResult.embedding, {
            type: 'blueprint_analysis',
            blueprintId: newBlueprint.id,
            analysisId: savedBlueprintAnalysis.analysisId,
            blueprintName: name,
            blueprintType: blueprintType,
            blueprintCategory: category,
            analysisDate: new Date().toISOString(),
            scores: blueprintAnalysis.scores,
            architecturePatterns: blueprintAnalysis.architecturePatterns,
            technologyStack: blueprintAnalysis.technologyStack,
            componentCount: analysisData.components?.length || 0
          });
          console.log(`✅ Blueprint analysis embedding stored: ${analysisPointId}`);
        }
      } catch (embeddingError) {
        console.warn('⚠️ Failed to store blueprint analysis embedding:', embeddingError);
      }
    }

    // Update blueprint with analysis metadata
    await Blueprint.findOneAndUpdate(
      { id: newBlueprint.id },
      {
        hasAnalysis: true,
        lastAnalysisId: savedBlueprintAnalysis.analysisId,
        lastAnalysisDate: new Date(),
        analysisScores: blueprintAnalysis.scores,
        componentCount: analysisData.components?.length || 0,
        architecturePatterns: blueprintAnalysis.architecturePatterns,
        technologyStack: blueprintAnalysis.technologyStack
      }
    );

    console.log(`✅ Successfully converted analysis ${analysisId} to blueprint ${newBlueprint.id}`);

    return NextResponse.json({
      success: true,
      blueprint: {
        ...newBlueprint,
        _id: savedBlueprint._id,
        hasEmbedding: embeddingService.isAvailable(),
        hasAnalysis: true
      },
      message: 'Analysis successfully converted to blueprint'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Failed to convert analysis to blueprint:', error);
    return NextResponse.json(
      {
        error: 'Failed to convert analysis to blueprint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

