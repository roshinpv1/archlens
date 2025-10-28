import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { blueprintAnalysisService } from '@/services/blueprintAnalysisService';
import { getSimilarityService } from '@/services/similarityService';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { 
      analysisId, 
      blueprintId, 
      threshold = 0.7,
      limit = 10,
      includeRecommendations = true 
    } = body;
    
    if (!analysisId && !blueprintId) {
      return NextResponse.json({ 
        error: 'Either analysisId or blueprintId is required' 
      }, { status: 400 });
    }
    
    let analysis;
    
    if (analysisId) {
      // Get analysis by analysisId
      analysis = await BlueprintAnalysis.findOne({ analysisId }).lean();
    } else if (blueprintId) {
      // Get analysis by blueprintId
      analysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();
    }
    
    if (!analysis) {
      return NextResponse.json({ 
        error: 'Analysis not found' 
      }, { status: 404 });
    }
    
    console.log(`🔍 Finding similar blueprints for analysis: ${analysis.analysisId}`);
    
    // Find similar blueprints using component-based similarity
    const similarBlueprints = await blueprintAnalysisService.findSimilarBlueprints(
      analysis, 
      threshold
    );
    
    // Limit results
    const limitedResults = similarBlueprints.slice(0, limit);
    
    let recommendations = [];
    if (includeRecommendations) {
      // Generate component recommendations
      recommendations = await blueprintAnalysisService.generateComponentRecommendations(
        analysis,
        limitedResults
      );
    }
    
    // Calculate similarity statistics
    const similarityStats = {
      totalFound: similarBlueprints.length,
      aboveThreshold: similarBlueprints.filter(bp => bp.similarityScore >= threshold).length,
      averageSimilarity: similarBlueprints.reduce((sum, bp) => sum + bp.similarityScore, 0) / similarBlueprints.length,
      topSimilarity: similarBlueprints.length > 0 ? similarBlueprints[0].similarityScore : 0
    };
    
    return NextResponse.json({
      success: true,
      analysis: {
        analysisId: analysis.analysisId,
        blueprintId: analysis.blueprintId,
        componentCount: analysis.components.length,
        architecturePatterns: analysis.architecturePatterns,
        technologyStack: analysis.technologyStack
      },
      similarBlueprints: limitedResults,
      recommendations,
      similarityStats,
      searchCriteria: {
        threshold,
        limit,
        includeRecommendations
      }
    });
    
  } catch (error) {
    console.error('❌ Similarity search failed:', error);
    return NextResponse.json(
      { 
        error: 'Similarity search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get('blueprintId');
    const threshold = parseFloat(searchParams.get('threshold') || '0.7');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!blueprintId) {
      return NextResponse.json({ 
        error: 'Blueprint ID is required' 
      }, { status: 400 });
    }
    
    // Get analysis for the blueprint
    const analysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();
    if (!analysis) {
      return NextResponse.json({ 
        error: 'Analysis not found for this blueprint' 
      }, { status: 404 });
    }
    
    // Use similarity service for vector-based search
    const similarityService = getSimilarityService();
    const similarBlueprints = await similarityService.findSimilarBlueprintsForAnalysis(analysis);
    
    // Filter by threshold and limit
    const filteredResults = similarBlueprints
      .filter(bp => bp.similarityScore >= threshold)
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      blueprintId,
      similarBlueprints: filteredResults,
      searchCriteria: {
        threshold,
        limit
      }
    });
    
  } catch (error) {
    console.error('❌ Similarity search failed:', error);
    return NextResponse.json(
      { 
        error: 'Similarity search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
