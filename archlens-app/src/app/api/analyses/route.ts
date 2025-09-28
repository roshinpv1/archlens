import { NextRequest, NextResponse } from 'next/server';
import { getAnalyses, AnalysisQuery } from '@/services/analysisService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: AnalysisQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      appId: searchParams.get('appId') || undefined,
      environment: searchParams.get('environment') || undefined,
      status: searchParams.get('status') || undefined,
    };

    // Handle date filtering
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');
    
    if (dateFromStr) {
      query.dateFrom = new Date(dateFromStr);
    }
    
    if (dateToStr) {
      query.dateTo = new Date(dateToStr);
    }

    const result = await getAnalyses(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyses API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analyses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
