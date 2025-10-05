import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, connectToDatabase } from '@/services/analysisService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    console.log('Fetching analysis with ID:', analysisId);
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }
    
    const analysis = await getAnalysisById(analysisId);
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }
    
    console.log('Analysis found:', {
      id: analysis._id,
      appId: analysis.appId,
      componentName: analysis.componentName,
      fileName: analysis.fileName
    });
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
