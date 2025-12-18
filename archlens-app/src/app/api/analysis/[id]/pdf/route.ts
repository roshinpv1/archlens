import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/services/analysisService';
import { ArchitectureAnalysis } from '@/types/architecture';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';

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

    // Convert IAnalysis to ArchitectureAnalysis format
    const architectureAnalysis: ArchitectureAnalysis = {
      id: analysis.id || analysis._id.toString(),
      timestamp: analysis.timestamp,
      fileName: analysis.fileName,
      fileType: analysis.fileType as 'image' | 'iac' | 'text',
      originalFile: analysis.originalFile ? {
        name: analysis.originalFile.name,
        size: analysis.originalFile.size,
        type: analysis.originalFile.type,
        data: analysis.originalFile.data,
        mimeType: analysis.originalFile.mimeType
      } : undefined,
      appId: analysis.appId,
      componentName: analysis.componentName,
      description: analysis.description,
      environment: analysis.environment,
      version: analysis.version,
      metadata: analysis.metadata as any,
      components: (analysis.components || []) as any[],
      connections: (analysis.connections || []) as any[],
      risks: (analysis.risks || []).map((risk: any) => ({
        id: risk.id || '',
        title: risk.title || '',
        description: risk.description || '',
        severity: risk.severity || risk.level || 'medium',
        category: risk.category || 'security',
        impact: risk.impact || '',
        recommendation: risk.recommendation || '',
        recommendations: risk.recommendations || [],
        components: risk.components || []
      })),
      complianceGaps: (analysis.complianceGaps || []).map((gap: any) => ({
        id: gap.id || '',
        framework: gap.framework || '',
        requirement: gap.requirement || '',
        description: gap.description || '',
        severity: gap.severity || 'medium',
        remediation: gap.remediation || '',
        components: gap.components || []
      })),
      costIssues: (analysis.costIssues || []).map((issue: any) => ({
        id: issue.id || '',
        title: issue.title || '',
        description: issue.description || '',
        category: issue.category || '',
        estimatedSavingsUSD: issue.estimatedSavingsUSD || issue.estimatedSavings || 0,
        recommendation: issue.recommendation || '',
        components: issue.components || [],
        severity: issue.severity || 'medium'
      })),
      recommendations: (analysis.recommendations || []).map((rec: any) => ({
        id: rec.id || '',
        issue: rec.issue || '',
        fix: rec.fix || '',
        impact: rec.impact || 'medium',
        effort: rec.effort || 'medium',
        priority: rec.priority || 1,
        category: rec.category || 'security'
      })),
      resiliencyScore: analysis.resiliencyScore || 0,
      securityScore: analysis.securityScore || 0,
      costEfficiencyScore: analysis.costEfficiencyScore || 0,
      complianceScore: analysis.complianceScore || 0,
      estimatedSavingsUSD: analysis.estimatedSavingsUSD || 0,
      summary: analysis.summary || '',
      architectureDescription: analysis.architectureDescription || '',
      processingTime: 0,
      llmProvider: analysis.llmProvider || '',
      llmModel: analysis.llmModel || '',
      similarBlueprints: ((analysis as any).similarBlueprints || []).map((bp: any) => ({
        id: bp.blueprint?.id || bp.id || '',
        name: bp.blueprint?.name || 'Unknown',
        type: bp.blueprint?.type || '',
        category: bp.blueprint?.category || '',
        cloudProvider: bp.blueprint?.cloudProvider || '',
        complexity: bp.blueprint?.complexity || '',
        tags: bp.blueprint?.tags || [],
        score: bp.score || 0
      }))
    };

    // Generate PDF
    const { PDFReport } = await import('@/components/PDFReport');
    const pdfDocument = React.createElement(PDFReport, { analysis: architectureAnalysis });
    const pdfBuffer = await renderToBuffer(pdfDocument);

    // Set appropriate headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', pdfBuffer.length.toString());
    headers.set('Content-Disposition', `attachment; filename="architecture-analysis-${analysisId}.pdf"`);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

