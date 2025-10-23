/**
 * Blueprint Similarity Search API
 * GET /api/blueprints/similarity - Search for similar blueprints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSimilarityService } from '@/services/similarityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const blueprintId = searchParams.get('blueprintId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const threshold = parseFloat(searchParams.get('threshold') || '0.6');

    if (!query && !blueprintId) {
      return NextResponse.json(
        { error: 'Either query or blueprintId parameter is required' },
        { status: 400 }
      );
    }

    const similarityService = getSimilarityService();
    let result;

    if (blueprintId) {
      // Find similar blueprints for a specific blueprint
      result = await similarityService.findSimilarBlueprintsForBlueprint(blueprintId);
    } else {
      // Search by content query
      result = await similarityService.findSimilarBlueprintsByContent(query!);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to find similar blueprints' },
        { status: 500 }
      );
    }

    // Filter by threshold and limit
    const filteredBlueprints = result.similarBlueprints
      ?.filter(bp => bp.score >= threshold)
      .slice(0, limit) || [];

    return NextResponse.json({
      success: true,
      similarBlueprints: filteredBlueprints,
      total: filteredBlueprints.length,
      threshold,
      limit
    });

  } catch (error) {
    console.error('Blueprint similarity search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisContent, limit = 2, threshold = 0.7 } = body;

    if (!analysisContent) {
      return NextResponse.json(
        { error: 'Analysis content is required' },
        { status: 400 }
      );
    }

    const similarityService = getSimilarityService();
    const result = await similarityService.findSimilarBlueprintsForAnalysis(analysisContent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to find similar blueprints' },
        { status: 500 }
      );
    }

    // Filter by threshold and limit
    const filteredBlueprints = result.similarBlueprints
      ?.filter(bp => bp.score >= threshold)
      .slice(0, limit) || [];

    return NextResponse.json({
      success: true,
      similarBlueprints: filteredBlueprints,
      analysisId: result.analysisId,
      total: filteredBlueprints.length,
      threshold,
      limit
    });

  } catch (error) {
    console.error('Blueprint similarity search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
