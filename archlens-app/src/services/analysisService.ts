import mongoose from 'mongoose';
import Analysis, { IAnalysis } from '@/models/Analysis';
import { ArchitectureAnalysis } from '@/types/architecture';

// Connect to MongoDB
export async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    // Already connected
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Save analysis result to database
export async function saveAnalysis(analysis: ArchitectureAnalysis): Promise<IAnalysis> {
  await connectToDatabase();
  
  try {
    // 🔍 DEBUG POINT: Set breakpoint here to inspect analysis object before MongoDB save
    // Debug: Check what we're about to save
    console.log('🔍 Pre-save debug in analysisService:');
    console.log('analysis.components type:', typeof analysis.components, 'isArray:', Array.isArray(analysis.components));
    console.log('analysis.connections type:', typeof analysis.connections, 'isArray:', Array.isArray(analysis.connections));
    if (Array.isArray(analysis.components) && analysis.components.length > 0) {
      console.log('First component type:', typeof analysis.components[0], 'content:', JSON.stringify(analysis.components[0]).substring(0, 200));
    }
    if (Array.isArray(analysis.connections) && analysis.connections.length > 0) {
      console.log('First connection type:', typeof analysis.connections[0], 'content:', JSON.stringify(analysis.connections[0]).substring(0, 200));
    }
    
    // Debug: Log exactly what we're passing to Mongoose
    console.log('🔍 About to create Mongoose document with:');
    console.log('components type:', typeof analysis.components, 'isArray:', Array.isArray(analysis.components), 'length:', analysis.components?.length);
    console.log('connections type:', typeof analysis.connections, 'isArray:', Array.isArray(analysis.connections), 'length:', analysis.connections?.length);
    
    // Try direct object creation without Mongoose constructor
    const documentData = {
      timestamp: analysis.timestamp || new Date(),
      fileName: analysis.fileName,
      fileType: analysis.fileType,
      originalFile: analysis.originalFile,
      appId: analysis.appId,
      componentName: analysis.componentName,
      description: analysis.description,
      environment: analysis.environment,
      version: analysis.version,
      components: analysis.components,
      connections: analysis.connections,
      risks: analysis.risks,
      complianceGaps: analysis.complianceGaps || [],
      costIssues: analysis.costIssues || [],
      recommendations: analysis.recommendations || [],
      resiliencyScore: analysis.resiliencyScore || 0,
      securityScore: analysis.securityScore || 0,
      costEfficiencyScore: analysis.costEfficiencyScore || 0,
      complianceScore: analysis.complianceScore || 0,
      estimatedSavingsUSD: analysis.estimatedSavingsUSD || 0,
      summary: analysis.summary,
      architectureDescription: analysis.architectureDescription,
      processingTime: analysis.processingTime || 0,
      llmProvider: analysis.llmProvider,
      llmModel: analysis.llmModel,
      tags: [],
      status: 'completed'
    };
    
           console.log('🔍 Final document data before save:');
           console.log('documentData.components type:', typeof documentData.components, 'isArray:', Array.isArray(documentData.components));
           console.log('🔍 Scores being saved to database:');
           console.log('resiliencyScore:', documentData.resiliencyScore, 'type:', typeof documentData.resiliencyScore);
           console.log('securityScore:', documentData.securityScore, 'type:', typeof documentData.securityScore);
           console.log('costEfficiencyScore:', documentData.costEfficiencyScore, 'type:', typeof documentData.costEfficiencyScore);
           console.log('complianceScore:', documentData.complianceScore, 'type:', typeof documentData.complianceScore);
    
    // Use direct create() instead of new + save()
    const savedAnalysis = await Analysis.create(documentData);
    return savedAnalysis;
  } catch (error) {
    console.error('Error saving analysis:', error);
    console.error('Analysis data structure:', JSON.stringify({
      componentsType: typeof analysis.components,
      connectionsType: typeof analysis.connections,
      risksType: typeof analysis.risks,
      componentsIsArray: Array.isArray(analysis.components),
      connectionsIsArray: Array.isArray(analysis.connections),
      risksIsArray: Array.isArray(analysis.risks)
    }, null, 2));
    throw new Error('Failed to save analysis to database');
  }
}

// Get analysis by ID
export async function getAnalysisById(id: string): Promise<IAnalysis | null> {
  await connectToDatabase();
  
  try {
    let analysis = null;
    
    // First, try to find by MongoDB ObjectId (if it's a valid ObjectId)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      analysis = await Analysis.findById(id);
    }
    
    // If not found or not a valid ObjectId, try to find by custom 'id' field
    if (!analysis) {
      analysis = await Analysis.findOne({ id: id });
    }
    
    // If still not found, try to find by _id as string
    if (!analysis) {
      analysis = await Analysis.findOne({ _id: id });
    }
    
    return analysis;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    // Try alternative query as fallback
    try {
      return await Analysis.findOne({ id: id });
    } catch (fallbackError) {
      throw new Error('Failed to fetch analysis from database');
    }
  }
}

// Get all analyses with pagination and filtering
export interface AnalysisQuery {
  page?: number;
  limit?: number;
  appId?: string;
  environment?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

export async function getAnalyses(query: AnalysisQuery = {}) {
  await connectToDatabase();
  
  const {
    page = 1,
    limit = 20,
    appId,
    environment,
    dateFrom,
    dateTo,
    status
  } = query;

  try {
    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (appId) filter.appId = appId;
    if (environment) filter.environment = environment;
    if (status) filter.status = status;
    
    if (dateFrom || dateTo) {
      const timeFilter: Record<string, Date> = {};
      if (dateFrom) timeFilter.$gte = dateFrom;
      if (dateTo) timeFilter.$lte = dateTo;
      filter.timestamp = timeFilter;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [analyses, totalCount] = await Promise.all([
      Analysis.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Analysis.countDocuments(filter)
    ]);

    return {
      analyses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw new Error('Failed to fetch analyses from database');
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  await connectToDatabase();
  
  try {
    const [
      totalAnalyses,
      recentAnalyses,
      avgScores,
      environmentStats,
      riskStats
    ] = await Promise.all([
      // Total analyses count
      Analysis.countDocuments({ status: 'completed' }),
      
      // Recent analyses (last 30 days)
      Analysis.countDocuments({
        status: 'completed',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Average scores
      Analysis.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            avgSecurity: { $avg: '$securityScore' },
            avgResilience: { $avg: '$resiliencyScore' },
            avgCostEfficiency: { $avg: '$costEfficiencyScore' },
            avgCompliance: { $avg: '$complianceScore' }
          }
        }
      ]),
      
      // Environment distribution
      Analysis.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$environment', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Risk distribution
      Analysis.aggregate([
        { $match: { status: 'completed' } },
        { $unwind: '$risks' },
        { $group: { _id: '$risks.severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Debug: Log the raw scores from database
    console.log('🔍 Raw scores from database aggregation:', avgScores[0]);
    
    const result = {
      totalAnalyses,
      recentAnalyses,
      averageScores: avgScores[0] || {
        avgSecurity: 0,
        avgResilience: 0,
        avgCostEfficiency: 0,
        avgCompliance: 0
      },
      environmentDistribution: environmentStats,
      riskDistribution: riskStats,
      timestamp: new Date()
    };
    
    // Debug: Log the final result
    console.log('🔍 Dashboard stats result:', result);
    
    return result;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

// Delete analysis
export async function deleteAnalysis(id: string): Promise<boolean> {
  await connectToDatabase();
  
  try {
    const result = await Analysis.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw new Error('Failed to delete analysis');
  }
}

// Update analysis
export async function updateAnalysis(id: string, updates: Partial<IAnalysis>): Promise<IAnalysis | null> {
  await connectToDatabase();
  
  try {
    const analysis = await Analysis.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return analysis;
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw new Error('Failed to update analysis');
  }
}
