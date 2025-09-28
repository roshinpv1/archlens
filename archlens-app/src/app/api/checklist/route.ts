import { NextRequest, NextResponse } from 'next/server';
import { 
  getChecklistItems, 
  createChecklistItem, 
  getChecklistStats,
  initializeDefaultChecklist 
} from '@/services/checklistService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      const stats = await getChecklistStats();
      return NextResponse.json(stats);
    }
    
    if (action === 'init') {
      await initializeDefaultChecklist();
      return NextResponse.json({ message: 'Default checklist initialized successfully' });
    }
    
    const items = await getChecklistItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Checklist API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch checklist items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const itemData = await request.json();
    
    // Validate required fields
    const requiredFields = ['category', 'item', 'description', 'recommendedAction', 'owner', 'priority'];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const newItem = await createChecklistItem(itemData);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Create checklist item error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checklist item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
