import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Validate the user is authenticated
    // 2. Check if the user has already rated this blueprint
    // 3. Update the rating in the database
    // 4. Recalculate the average rating

    // For now, we'll simulate this
    const updatedBlueprint = {
      id: blueprintId,
      rating: rating,
      message: 'Rating updated successfully'
    };

    return NextResponse.json(updatedBlueprint);
  } catch (error) {
    console.error('Error rating blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to rate blueprint' },
      { status: 500 }
    );
  }
}
