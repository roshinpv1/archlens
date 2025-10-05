import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { BlueprintType, BlueprintComplexity, BlueprintCategory } from '@/types/blueprint';
import { BlueprintQuery, BlueprintResponse } from '@/types/blueprint';

// Mock data for demonstration - in production, this would use MongoDB
const mockBlueprints = [
  {
    id: '1',
    name: 'E-commerce Microservices Architecture',
    description: 'Complete e-commerce platform with microservices architecture on AWS',
    type: BlueprintType.ARCHITECTURE,
    category: BlueprintCategory.E_COMMERCE,
    tags: ['microservices', 'aws', 'e-commerce', 'scalable'],
    fileName: 'ecommerce-architecture.png',
    fileSize: 2048576,
    fileType: 'image/png',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'John Doe',
    isPublic: true,
    downloadCount: 45,
    rating: 4.8,
    version: '1.2.0',
    cloudProviders: ['AWS'],
    complexity: BlueprintComplexity.HIGH,
    metadata: {
      components: 12,
      connections: 18,
      estimatedCost: 2500,
      deploymentTime: '2-3 weeks'
    }
  },
  {
    id: '2',
    name: 'Kubernetes Production Setup',
    description: 'Production-ready Kubernetes cluster with monitoring and logging',
    type: BlueprintType.IAC,
    category: BlueprintCategory.DEVOPS,
    tags: ['kubernetes', 'terraform', 'monitoring', 'production'],
    fileName: 'k8s-production.tf',
    fileSize: 153600,
    fileType: 'text/plain',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'Jane Smith',
    isPublic: true,
    downloadCount: 32,
    rating: 4.6,
    version: '2.1.0',
    cloudProviders: ['AWS', 'Azure'],
    complexity: BlueprintComplexity.HIGH,
    metadata: {
      components: 8,
      connections: 15,
      estimatedCost: 1800,
      deploymentTime: '1-2 weeks'
    }
  },
  {
    id: '3',
    name: 'Simple Web Application',
    description: 'Basic web application with database and CDN',
    type: BlueprintType.TEMPLATE,
    category: BlueprintCategory.WEB_DEVELOPMENT,
    tags: ['web', 'simple', 'database', 'cdn'],
    fileName: 'simple-web-app.yaml',
    fileSize: 8192,
    fileType: 'text/yaml',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    createdBy: 'Mike Johnson',
    isPublic: true,
    downloadCount: 67,
    rating: 4.2,
    version: '1.0.0',
    cloudProviders: ['AWS'],
    complexity: BlueprintComplexity.LOW,
    metadata: {
      components: 4,
      connections: 6,
      estimatedCost: 500,
      deploymentTime: '2-3 days'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    const query: BlueprintQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as BlueprintType || undefined,
      category: searchParams.get('category') as BlueprintCategory || undefined,
      cloudProvider: searchParams.get('cloudProvider') || undefined,
      complexity: searchParams.get('complexity') as BlueprintComplexity || undefined,
      isPublic: searchParams.get('isPublic') === 'true' ? true : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      sortBy: (searchParams.get('sortBy') as 'name' | 'createdAt' | 'downloadCount' | 'rating') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // Filter blueprints based on query
    let filteredBlueprints = [...mockBlueprints];

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredBlueprints = filteredBlueprints.filter(blueprint =>
        blueprint.name.toLowerCase().includes(searchLower) ||
        blueprint.description.toLowerCase().includes(searchLower) ||
        blueprint.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (query.type) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.type === query.type);
    }

    if (query.category) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.category === query.category);
    }

    if (query.cloudProvider) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => 
        blueprint.cloudProviders.includes(query.cloudProvider!)
      );
    }

    if (query.complexity) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.complexity === query.complexity);
    }

    if (query.isPublic !== undefined) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.isPublic === query.isPublic);
    }

    if (query.tags && query.tags.length > 0) {
      filteredBlueprints = filteredBlueprints.filter(blueprint =>
        query.tags!.some(tag => blueprint.tags.includes(tag))
      );
    }

    // Sort blueprints
    if (query.sortBy) {
      filteredBlueprints.sort((a, b) => {
        let aValue: string | number | Date = a[query.sortBy as keyof typeof a] as string | number | Date;
        let bValue: string | number | Date = b[query.sortBy as keyof typeof b] as string | number | Date;

        if (query.sortBy === 'createdAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (query.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Pagination
    const totalCount = filteredBlueprints.length;
    const totalPages = Math.ceil(totalCount / query.limit!);
    const skip = (query.page! - 1) * query.limit!;
    const paginatedBlueprints = filteredBlueprints.slice(skip, skip + query.limit!);

    const response: BlueprintResponse = {
      blueprints: paginatedBlueprints,
      pagination: {
        page: query.page!,
        limit: query.limit!,
        totalCount,
        totalPages,
        hasNextPage: query.page! < totalPages,
        hasPrevPage: query.page! > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Blueprints API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blueprints',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as BlueprintType;
    const category = formData.get('category') as BlueprintCategory;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const isPublic = formData.get('isPublic') === 'true';
    const complexity = formData.get('complexity') as BlueprintComplexity;
    const cloudProviders = JSON.parse(formData.get('cloudProviders') as string || '[]');
    const estimatedCost = formData.get('estimatedCost') ? parseInt(formData.get('estimatedCost') as string) : undefined;
    const deploymentTime = formData.get('deploymentTime') as string;

    if (!file || !name || !description || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Save the file to cloud storage (AWS S3, Azure Blob, etc.)
    // 2. Generate a thumbnail for images
    // 3. Store metadata in MongoDB
    // 4. Handle file validation and security

    const newBlueprint = {
      id: Date.now().toString(),
      name,
      description,
      type,
      category,
      tags,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User', // This would come from auth context
      isPublic,
      downloadCount: 0,
      rating: 0,
      version: '1.0.0',
      cloudProviders,
      complexity,
      metadata: {
        components: 0, // Default values - would be calculated in production
        connections: 0,
        estimatedCost: estimatedCost || 0,
        deploymentTime: deploymentTime || 'Unknown'
      }
    };

    // Add to mock data (in production, save to database)
    mockBlueprints.unshift(newBlueprint);

    return NextResponse.json(newBlueprint, { status: 201 });
  } catch (error) {
    console.error('Blueprint upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload blueprint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
