/**
 * Blueprint Similarity API for specific blueprint
 * GET /api/blueprints/[id]/similarity - Get similarity stats for a blueprint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSimilarityService } from '@/services/similarityService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const limit = parseInt(searchParams.get('limit') || '2');

    if (!id) {
      return NextResponse.json(
        { error: 'Blueprint ID is required' },
        { status: 400 }
      );
    }

    const similarityService = getSimilarityService();
    let result;

    if (detailed) {
      result = await similarityService.getDetailedSimilarBlueprints(id, limit);
    } else {
      result = await similarityService.findSimilarBlueprintsForBlueprint(id);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get similar blueprints' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blueprintId: id,
      similarBlueprints: result.similarBlueprints,
      total: result.similarBlueprints?.length || 0
    });

  } catch (error) {
    console.error('Blueprint similarity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { targetBlueprintId } = body;

    if (!id || !targetBlueprintId) {
      return NextResponse.json(
        { error: 'Both blueprint IDs are required' },
        { status: 400 }
      );
    }

    const similarityService = getSimilarityService();
    const result = await similarityService.getBlueprintSimilarityScore(id, targetBlueprintId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to calculate similarity score' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blueprintId1: id,
      blueprintId2: targetBlueprintId,
      similarityScore: result.score
    });

  } catch (error) {
    console.error('Blueprint similarity score error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
