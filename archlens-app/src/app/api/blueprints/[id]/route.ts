import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { getEmbeddingService } from '@/services/embeddingService';
import Blueprint from '@/models/Blueprint';

// No mock data - all data comes from MongoDB

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    console.log('Fetching blueprint with ID:', blueprintId);
    
    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID is required' }, { status: 400 });
    }
    
    // Fetch from MongoDB only
    let blueprint;
    try {
      blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    } catch (dbError) {
      console.error('Failed to fetch blueprint from MongoDB:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch blueprint from database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }
    
    console.log('Blueprint found:', {
      id: blueprint.id,
      name: blueprint.name,
      type: blueprint.type
    });
    
    return NextResponse.json(blueprint);
  } catch (error) {
    console.error('Error fetching blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blueprint' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    const updates = await request.json();
    
    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID is required' }, { status: 400 });
    }
    
    // Update in MongoDB only
    let updatedBlueprint;
    try {
      updatedBlueprint = await Blueprint.findOneAndUpdate(
        { id: blueprintId },
        { ...updates, updatedAt: new Date() },
        { new: true, lean: true }
      );
      
      if (!updatedBlueprint) {
        return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('Failed to update blueprint in MongoDB:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to update blueprint in database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Update embedding if blueprint content changed
    try {
      const embeddingService = getEmbeddingService();
      if (embeddingService.isAvailable()) {
        const embeddingResult = await embeddingService.updateBlueprintEmbedding(updatedBlueprint);
        if (embeddingResult.success) {
          console.log(`✅ Blueprint embedding updated: ${embeddingResult.vectorId}`);
        } else {
          console.warn(`⚠️ Failed to update blueprint embedding: ${embeddingResult.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to update blueprint embedding:', error);
      // Don't fail the update if embedding update fails
    }
    
    return NextResponse.json(updatedBlueprint);
  } catch (error) {
    console.error('Error updating blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to update blueprint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Delete from MongoDB only
    let deletedBlueprint;
    try {
      deletedBlueprint = await Blueprint.findOneAndDelete({ id: blueprintId }).lean();
      
      if (!deletedBlueprint) {
        return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('Failed to delete blueprint from MongoDB:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to delete blueprint from database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Delete embedding
    try {
      const embeddingService = getEmbeddingService();
      if (embeddingService.isAvailable()) {
        const embeddingResult = await embeddingService.deleteBlueprintEmbedding(blueprintId);
        if (embeddingResult.success) {
          console.log(`✅ Blueprint embedding deleted: ${embeddingResult.vectorId}`);
        } else {
          console.warn(`⚠️ Failed to delete blueprint embedding: ${embeddingResult.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete blueprint embedding:', error);
      // Don't fail the deletion if embedding deletion fails
    }
    
    return NextResponse.json({ message: 'Blueprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete blueprint' },
      { status: 500 }
    );
  }
}
