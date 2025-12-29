import { NextRequest, NextResponse } from 'next/server';
import { addGoalUpdate } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { goalId, content, authorId } = await request.json();

    if (!goalId || !content || !authorId) {
      return NextResponse.json(
        { error: 'goalId, content, and authorId are required' },
        { status: 400 }
      );
    }

    const update = await addGoalUpdate(goalId, content, authorId);
    return NextResponse.json(update);
  } catch (error) {
    console.error('Failed to add goal update:', error);
    return NextResponse.json(
      { error: 'Failed to add goal update' },
      { status: 500 }
    );
  }
}
