import { NextRequest, NextResponse } from 'next/server';
import { getMilestones, addMilestone, updateMilestone, deleteMilestone } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const milestones = await getMilestones();
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Failed to get milestones:', error);
    return NextResponse.json(
      { error: 'Failed to get milestones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, deadline } = await request.json();

    if (!title || !deadline) {
      return NextResponse.json(
        { error: 'Title and deadline are required' },
        { status: 400 }
      );
    }

    const milestone = await addMilestone(title, deadline);
    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Failed to add milestone:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to add milestone: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { milestoneId, title, deadline, achieved } = await request.json();

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    await updateMilestone(milestoneId, { title, deadline, achieved });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get('id');

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    await deleteMilestone(milestoneId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
