import { NextRequest, NextResponse } from 'next/server';
import { 
  updateChecklistItem, 
  deleteChecklistItem, 
  toggleChecklistItem 
} from '@/services/checklistService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'toggle') {
      const item = await toggleChecklistItem(id);
      if (!item) {
        return NextResponse.json(
          { error: 'Checklist item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }
    
    const updates = await request.json();
    const item = await updateChecklistItem(id, updates);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Update checklist item error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update checklist item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteChecklistItem(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete checklist item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
