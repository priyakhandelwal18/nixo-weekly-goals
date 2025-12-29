import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (goalsError) throw goalsError;

    const goals = (goalsData || []).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      assigneeId: row.assignee_id,
      weekId: row.week_id,
      milestoneId: row.milestone_id || undefined,
      createdAt: row.created_at,
      updates: [],
    }));

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Failed to get all goals:', error);
    return NextResponse.json(
      { error: 'Failed to get all goals' },
      { status: 500 }
    );
  }
}
