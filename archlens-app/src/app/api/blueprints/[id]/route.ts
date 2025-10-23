import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { getEmbeddingService } from '@/services/embeddingService';

// Mock data - in production, this would fetch from MongoDB
const mockBlueprints = [
  {
    id: '1',
    name: 'E-commerce Microservices Architecture',
    description: 'Complete e-commerce platform with microservices architecture on AWS',
    type: 'architecture',
    category: 'E-commerce',
    tags: ['microservices', 'aws', 'e-commerce', 'scalable'],
    fileName: 'ecommerce-architecture.png',
    fileSize: 2048576,
    fileType: 'image/png',
    fileData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'John Doe',
    isPublic: true,
    downloadCount: 45,
    rating: 4.8,
    version: '1.2.0',
    cloudProviders: ['AWS'],
    complexity: 'high',
    metadata: {
      components: 12,
      connections: 18,
      estimatedCost: 2500,
      deploymentTime: '2-3 weeks'
    }
  }
];

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
    
    const blueprint = mockBlueprints.find(b => b.id === blueprintId);
    
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
    
    const blueprintIndex = mockBlueprints.findIndex(b => b.id === blueprintId);
    
    if (blueprintIndex === -1) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }
    
    // Update blueprint
    const updatedBlueprint = {
      ...mockBlueprints[blueprintIndex],
      ...updates,
      updatedAt: new Date()
    };
    mockBlueprints[blueprintIndex] = updatedBlueprint;

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
    
    const blueprintIndex = mockBlueprints.findIndex(b => b.id === blueprintId);
    
    if (blueprintIndex === -1) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }
    
    // Remove blueprint
    const deletedBlueprint = mockBlueprints[blueprintIndex];
    mockBlueprints.splice(blueprintIndex, 1);

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
