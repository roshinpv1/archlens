import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { blueprintAnalysisService } from '@/services/blueprintAnalysisService';
import { getSimilarityService } from '@/services/similarityService';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';

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
    
    // Get blueprint from database
    const blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }
    
    console.log(`🔍 Starting blueprint analysis for: ${blueprint.name}`);
    
    // Check if analysis already exists
    const existingAnalysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();
    if (existingAnalysis) {
      console.log(`📋 Analysis already exists for blueprint: ${blueprintId}`);
      return NextResponse.json({
        success: true,
        analysis: existingAnalysis,
        message: 'Analysis already exists'
      });
    }
    
    // Perform blueprint analysis
    const analysis = await blueprintAnalysisService.analyzeBlueprint(blueprint);
    
    // Save analysis to database (use upsert to handle race conditions)
    const savedAnalysis = await BlueprintAnalysis.findOneAndUpdate(
      { blueprintId },
      analysis,
      { upsert: true, new: true }
    );
    console.log(`✅ Blueprint analysis saved: ${savedAnalysis.analysisId}`);
    
    // Find similar blueprints
    const similarBlueprints = await blueprintAnalysisService.findSimilarBlueprints(analysis);
    console.log(`🔍 Found ${similarBlueprints.length} similar blueprints`);
    
    // Generate recommendations
    const recommendations = await blueprintAnalysisService.generateComponentRecommendations(
      analysis, 
      similarBlueprints
    );
    console.log(`💡 Generated ${recommendations.length} recommendations`);
    
    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
      similarBlueprints,
      recommendations,
      message: 'Blueprint analysis completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Blueprint analysis failed:', error);
    return NextResponse.json(
      { 
        error: 'Blueprint analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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
    
    // Get analysis from database
    const analysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }
    
    // Get similar blueprints
    const similarityService = getSimilarityService();
    const similarBlueprints = await similarityService.findSimilarBlueprintsForAnalysis(analysis);
    
    return NextResponse.json({
      success: true,
      analysis,
      similarBlueprints
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch blueprint analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blueprint analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
