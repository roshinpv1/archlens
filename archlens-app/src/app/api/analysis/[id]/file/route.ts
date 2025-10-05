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
    
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', analysis.originalFile.mimeType);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Content-Disposition', `attachment; filename="${analysis.originalFile.name}"`);
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
