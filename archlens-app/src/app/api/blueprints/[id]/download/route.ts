import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import Blueprint from '@/models/Blueprint';

// Helper function to sanitize filename for HTTP headers
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/[^\x20-\x7E]/g, '_') // Replace non-ASCII with underscore
    .replace(/["\\]/g, '_') // Replace quotes and backslashes
    .trim();
}

// Helper function to encode filename for RFC 5987 (UTF-8 encoding)
function encodeRFC5987(str: string): string {
  return encodeURIComponent(str)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A');
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

    // Convert base64 data back to buffer
    const fileBuffer = Buffer.from(blueprint.originalFile.data, 'base64');
    
    const safeFilename = sanitizeFilename(blueprint.originalFile.name);
    const originalFilename = blueprint.originalFile.name;
    
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', blueprint.originalFile.mimeType || blueprint.fileType);
    headers.set('Content-Length', fileBuffer.length.toString());
    // Use both filename (ASCII-safe) and filename* (RFC 5987 encoded) for maximum compatibility
    headers.set('Content-Disposition', 
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeRFC5987(originalFilename)}`
    );
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error downloading blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to download blueprint', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
