import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { BlueprintType, BlueprintComplexity, BlueprintCategory } from '@/types/blueprint';
import { BlueprintQuery, BlueprintResponse } from '@/types/blueprint';
import Blueprint from '@/models/Blueprint';

// No mock data - all data comes from MongoDB

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as BlueprintType | null;
    const category = searchParams.get('category') as BlueprintCategory | null;
    const complexity = searchParams.get('complexity') as BlueprintComplexity | null;
    const cloudProvider = searchParams.get('cloudProvider') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const isPublic = searchParams.get('isPublic');
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'name' | 'createdAt' | 'downloadCount' | 'rating';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (complexity) query.complexity = complexity;
    if (cloudProvider) query.cloudProviders = { $in: [cloudProvider] };
    if (tags.length > 0) query.tags = { $in: tags };
    if (minRating > 0) query.rating = { $gte: minRating };
    if (isPublic !== null) query.isPublic = isPublic === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [blueprints, totalCount] = await Promise.all([
      Blueprint.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blueprint.countDocuments(query)
    ]);

    const response: BlueprintResponse = {
      blueprints: blueprints.map(bp => ({
        id: bp.id,
        name: bp.name,
        description: bp.description,
        type: bp.type as BlueprintType,
        category: bp.category as BlueprintCategory,
        tags: bp.tags,
        fileName: bp.fileName,
        fileSize: bp.fileSize,
        fileType: bp.fileType,
        fileUrl: bp.fileUrl,
        createdAt: bp.createdAt,
        updatedAt: bp.updatedAt,
        createdBy: bp.createdBy,
        isPublic: bp.isPublic,
        downloadCount: bp.downloadCount,
        rating: bp.rating,
        version: bp.version,
        cloudProviders: bp.cloudProviders,
        complexity: bp.complexity as BlueprintComplexity,
        metadata: bp.metadata,
        hasEmbedding: bp.hasEmbedding || false,
        hasAnalysis: bp.hasAnalysis || false
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch blueprints',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST handler removed - blueprints are now created via /api/analysis/[id]/convert-to-blueprint
// This keeps the codebase simpler and ensures all blueprints come from analyzed architectures
