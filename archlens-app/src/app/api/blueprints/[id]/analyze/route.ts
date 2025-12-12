import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';

/**
 * Get blueprint analysis
 * GET /api/blueprints/[id]/analyze
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    
    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID is required' }, { status: 400 });
    }

    // Fetch blueprint
    const blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    // Fetch blueprint analysis
    const analysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();
    
    if (!analysis) {
      console.log(`⚠️ No analysis found for blueprint ${blueprintId}`);
      return NextResponse.json({ 
        success: false,
        message: 'No analysis available for this blueprint',
        analysis: null
      });
    }

    console.log(`✅ Found analysis for blueprint ${blueprintId}:`, {
      analysisId: analysis.analysisId,
      components: analysis.components?.length || 0,
      risks: analysis.risks?.length || 0,
      complianceGaps: analysis.complianceGaps?.length || 0,
      costIssues: analysis.costIssues?.length || 0,
      recommendations: analysis.recommendations?.length || 0
    });

    return NextResponse.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Error fetching blueprint analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blueprint analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Run analysis for a blueprint
 * POST /api/blueprints/[id]/analyze
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    
    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID is required' }, { status: 400 });
    }

    // Fetch blueprint
    const blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    // Check if blueprint has the necessary data for analysis
    if (!blueprint.originalFile || !blueprint.originalFile.data) {
      return NextResponse.json(
        { error: 'Blueprint file data is required for analysis' },
        { status: 400 }
      );
    }

    // Import the blueprint analysis service
    const { blueprintAnalysisService } = await import('@/services/blueprintAnalysisService');
    
    // Convert blueprint to Blueprint type for service
    const blueprintForAnalysis: any = {
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      type: blueprint.type,
      category: blueprint.category,
      complexity: blueprint.complexity,
      cloudProviders: blueprint.cloudProviders || [],
      tags: blueprint.tags || []
    };
    
    // Generate analysis using the service
    const analysisResult = await blueprintAnalysisService.analyzeBlueprint(
      blueprintForAnalysis,
      (blueprint.metadata as any)?.extractedComponents || [],
      (blueprint.metadata as any)?.extractedConnections || []
    );

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Failed to generate blueprint analysis' },
        { status: 500 }
      );
    }

    // Save analysis to BlueprintAnalysis collection
    const savedAnalysis = await BlueprintAnalysis.findOneAndUpdate(
      { blueprintId: blueprintId },
      {
        blueprintId: blueprintId,
        analysisId: analysisResult.analysisId,
        components: analysisResult.components || [],
        componentRelationships: analysisResult.componentRelationships || [],
        architecturePatterns: analysisResult.architecturePatterns || [],
        technologyStack: analysisResult.technologyStack || [],
        componentComplexity: analysisResult.componentComplexity || {},
        scores: analysisResult.scores || {},
        risks: analysisResult.risks || [],
        complianceGaps: analysisResult.complianceGaps || [],
        costIssues: analysisResult.costIssues || [],
        recommendations: analysisResult.recommendations || [],
        insights: analysisResult.insights || [],
        bestPractices: analysisResult.bestPractices || [],
        industryStandards: analysisResult.industryStandards || [],
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update blueprint with analysis metadata
    await Blueprint.findOneAndUpdate(
      { id: blueprintId },
      {
        hasAnalysis: true,
        lastAnalysisId: analysisResult.analysisId,
        lastAnalysisDate: new Date(),
        analysisScores: analysisResult.scores,
        componentCount: analysisResult.components?.length || 0,
        architecturePatterns: analysisResult.architecturePatterns || [],
        technologyStack: analysisResult.technologyStack || []
      }
    );

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
      message: 'Blueprint analysis completed successfully'
    });

  } catch (error) {
    console.error('Error running blueprint analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run blueprint analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

