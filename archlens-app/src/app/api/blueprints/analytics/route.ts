import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import Blueprint from '@/models/Blueprint';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all blueprints from database
    const blueprints = await Blueprint.find({}).lean();
    
    if (blueprints.length === 0) {
      return NextResponse.json({
        totalBlueprints: 0,
        totalDownloads: 0,
        averageRating: 0,
        mostPopularCategory: '',
        mostDownloadedBlueprint: '',
        recentUploads: 0,
        topTags: [],
        categoryDistribution: [],
        complexityDistribution: [],
        monthlyStats: [],
        topContributors: []
      });
    }
    
    // Calculate basic metrics
    const totalBlueprints = blueprints.length;
    const totalDownloads = blueprints.reduce((sum, bp) => sum + (bp.downloadCount || 0), 0);
    const totalRating = blueprints.reduce((sum, bp) => sum + (bp.rating || 0), 0);
    const averageRating = totalRating / totalBlueprints;
    
    // Calculate recent uploads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUploads = blueprints.filter(bp => 
      new Date(bp.createdAt) >= thirtyDaysAgo
    ).length;
    
    // Calculate category distribution
    const categoryCounts: Record<string, number> = {};
    blueprints.forEach(bp => {
      const category = bp.category || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Number(((count / totalBlueprints) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate complexity distribution
    const complexityCounts: Record<string, number> = {};
    blueprints.forEach(bp => {
      const complexity = bp.complexity || 'medium';
      const complexityLabel = complexity.charAt(0).toUpperCase() + complexity.slice(1);
      complexityCounts[complexityLabel] = (complexityCounts[complexityLabel] || 0) + 1;
    });
    const complexityDistribution = Object.entries(complexityCounts)
      .map(([complexity, count]) => ({
        complexity,
        count,
        percentage: Number(((count / totalBlueprints) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate top tags
    const tagCounts: Record<string, number> = {};
    blueprints.forEach(bp => {
      (bp.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Find most popular category
    const mostPopularCategory = categoryDistribution.length > 0 
      ? categoryDistribution[0].category 
      : '';
    
    // Find most downloaded blueprint
    const mostDownloadedBlueprint = blueprints.reduce((max, bp) => 
      (bp.downloadCount || 0) > (max.downloadCount || 0) ? bp : max,
      blueprints[0]
    );
    
    // Calculate monthly stats (last 6 months)
    const monthlyStats: Array<{ month: string; uploads: number; downloads: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthBlueprints = blueprints.filter(bp => {
        const bpDate = new Date(bp.createdAt);
        return bpDate >= monthDate && bpDate < nextMonth;
      });
      
      const monthDownloads = monthBlueprints.reduce((sum, bp) => 
        sum + (bp.downloadCount || 0), 0
      );
      
      monthlyStats.push({
        month: monthKey,
        uploads: monthBlueprints.length,
        downloads: monthDownloads
      });
    }
    
    // Calculate top contributors (by createdBy)
    const contributorCounts: Record<string, { uploads: number; downloads: number }> = {};
    blueprints.forEach(bp => {
      const creator = bp.createdBy || 'Unknown';
      if (!contributorCounts[creator]) {
        contributorCounts[creator] = { uploads: 0, downloads: 0 };
      }
      contributorCounts[creator].uploads += 1;
      contributorCounts[creator].downloads += (bp.downloadCount || 0);
    });
    const topContributors = Object.entries(contributorCounts)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.uploads - a.uploads)
      .slice(0, 10);
    
    const analytics = {
      totalBlueprints,
      totalDownloads,
      averageRating: Number(averageRating.toFixed(1)),
      mostPopularCategory,
      mostDownloadedBlueprint: mostDownloadedBlueprint?.name || '',
      recentUploads,
      topTags,
      categoryDistribution,
      complexityDistribution,
      monthlyStats,
      topContributors
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
