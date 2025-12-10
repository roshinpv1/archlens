import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '../../../../../services/analysisService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }

    // Get the analysis from database
    const analysis = await getAnalysisById(analysisId);
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (!analysis.originalFile) {
      return NextResponse.json({ error: 'Original file not found for this analysis' }, { status: 404 });
    }

    // Convert base64 data back to buffer
    const fileBuffer = Buffer.from(analysis.originalFile.data, 'base64');
    
    // Sanitize filename for HTTP headers (remove/replace problematic characters)
    const sanitizeFilename = (filename: string): string => {
      // Remove or replace characters that can't be used in HTTP headers
      return filename
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/[^\x20-\x7E]/g, '_') // Replace non-ASCII with underscore
        .replace(/["\\]/g, '_') // Replace quotes and backslashes
        .trim();
    };
    
    const safeFilename = sanitizeFilename(analysis.originalFile.name);
    
    // Encode filename for RFC 5987 (UTF-8 encoding)
    const encodeRFC5987 = (str: string): string => {
      return encodeURIComponent(str)
        .replace(/['()]/g, escape)
        .replace(/\*/g, '%2A');
    };
    
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', analysis.originalFile.mimeType);
    headers.set('Content-Length', fileBuffer.length.toString());
    // Use both filename (ASCII-safe) and filename* (RFC 5987 encoded) for maximum compatibility
    headers.set('Content-Disposition', 
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeRFC5987(analysis.originalFile.name)}`
    );
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error serving analysis file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
