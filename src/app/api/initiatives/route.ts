import { NextRequest, NextResponse } from 'next/server';
import { getInitiatives, addInitiative, updateInitiative, deleteInitiative } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const initiatives = await getInitiatives();
    return NextResponse.json(initiatives);
  } catch (error) {
    console.error('Failed to get initiatives:', error);
    return NextResponse.json(
      { error: 'Failed to get initiatives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, deadline, assigneeId } = await request.json();

    if (!title || !deadline || !assigneeId) {
      return NextResponse.json(
        { error: 'Title, deadline, and assigneeId are required' },
        { status: 400 }
      );
    }

    const initiative = await addInitiative(title, deadline, assigneeId);
    return NextResponse.json(initiative);
  } catch (error) {
    console.error('Failed to add initiative:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to add initiative: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { initiativeId, title, deadline, achieved, linkedGoalIds } = await request.json();

    if (!initiativeId) {
      return NextResponse.json(
        { error: 'Initiative ID is required' },
        { status: 400 }
      );
    }

    await updateInitiative(initiativeId, { title, deadline, achieved, linkedGoalIds });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update initiative:', error);
    return NextResponse.json(
      { error: 'Failed to update initiative' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initiativeId = searchParams.get('id');

    if (!initiativeId) {
      return NextResponse.json(
        { error: 'Initiative ID is required' },
        { status: 400 }
      );
    }

    await deleteInitiative(initiativeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete initiative:', error);
    return NextResponse.json(
      { error: 'Failed to delete initiative' },
      { status: 500 }
    );
  }
}
