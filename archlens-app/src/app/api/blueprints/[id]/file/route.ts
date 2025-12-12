import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import Blueprint from '@/models/Blueprint';

/**
 * Get blueprint file/image for viewing
 * GET /api/blueprints/[id]/file
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

    // Fetch the blueprint from database
    const blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    // Check if original file data exists
    if (!blueprint.originalFile || !blueprint.originalFile.data) {
      return NextResponse.json(
        { error: 'Original file not found for this blueprint' },
        { status: 404 }
      );
    }

    // Only serve images inline (for viewing)
    const mimeType = blueprint.originalFile.mimeType || blueprint.fileType;
    if (!mimeType || !mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File is not an image' },
        { status: 400 }
      );
    }

    // Convert base64 data back to buffer
    const fileBuffer = Buffer.from(blueprint.originalFile.data, 'base64');
    
    // Set appropriate headers for inline image viewing
    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error fetching blueprint file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blueprint file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

