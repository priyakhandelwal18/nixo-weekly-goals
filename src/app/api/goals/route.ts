import { NextRequest, NextResponse } from 'next/server';
import { getGoalsForWeek, addGoal, updateGoal, deleteGoal } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('weekId');

    if (!weekId) {
      return NextResponse.json(
        { error: 'Week ID is required' },
        { status: 400 }
      );
    }

    const goals = await getGoalsForWeek(weekId);
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Failed to get goals:', error);
    return NextResponse.json(
      { error: 'Failed to get goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, assigneeId, weekId, priority } = await request.json();

    if (!title || !assigneeId || !weekId) {
      return NextResponse.json(
        { error: 'Title, assigneeId, and weekId are required' },
        { status: 400 }
      );
    }

    const goal = await addGoal(title, assigneeId, weekId, priority || 3);
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Failed to add goal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to add goal: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { goalId, title, status, priority } = await request.json();

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await updateGoal(goalId, { title, status, priority });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('id');

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await deleteGoal(goalId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
