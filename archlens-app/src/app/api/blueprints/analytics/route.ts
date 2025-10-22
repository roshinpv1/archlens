import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, you would fetch analytics from your database
    const analytics = {
      totalBlueprints: 156,
      totalDownloads: 2847,
      averageRating: 4.3,
      mostPopularCategory: 'DevOps',
      mostDownloadedBlueprint: 'Kubernetes Production Setup',
      recentUploads: 12,
      topTags: [
        { tag: 'aws', count: 45 },
        { tag: 'kubernetes', count: 38 },
        { tag: 'terraform', count: 32 },
        { tag: 'microservices', count: 28 },
        { tag: 'docker', count: 25 }
      ],
      categoryDistribution: [
        { category: 'DevOps', count: 45, percentage: 28.8 },
        { category: 'E-commerce', count: 32, percentage: 20.5 },
        { category: 'Web Development', count: 28, percentage: 17.9 },
        { category: 'Data Analytics', count: 25, percentage: 16.0 },
        { category: 'AI/ML', count: 15, percentage: 9.6 },
        { category: 'Security', count: 11, percentage: 7.1 }
      ],
      complexityDistribution: [
        { complexity: 'Low', count: 45, percentage: 28.8 },
        { complexity: 'Medium', count: 67, percentage: 42.9 },
        { complexity: 'High', count: 44, percentage: 28.2 }
      ],
      monthlyStats: [
        { month: '2024-01', uploads: 15, downloads: 234 },
        { month: '2024-02', uploads: 18, downloads: 287 },
        { month: '2024-03', uploads: 22, downloads: 345 },
        { month: '2024-04', uploads: 19, downloads: 298 },
        { month: '2024-05', uploads: 25, downloads: 412 },
        { month: '2024-06', uploads: 28, downloads: 456 }
      ],
      topContributors: [
        { name: 'John Doe', uploads: 12, downloads: 456 },
        { name: 'Jane Smith', uploads: 8, downloads: 234 },
        { name: 'Mike Johnson', uploads: 6, downloads: 189 }
      ]
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
