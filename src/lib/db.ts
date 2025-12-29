import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamMember, Goal, GoalStatus, GoalUpdate, Milestone } from '@/types';
import { generateId, AVATAR_COLORS } from './utils';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await getSupabase()
    .from('team_members')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
  }));
}

export async function addTeamMember(name: string): Promise<TeamMember> {
  const id = generateId();
  const members = await getTeamMembers();
  const colorIndex = members.length % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIndex];

  const { error } = await getSupabase()
    .from('team_members')
    .insert({ id, name, color });

  if (error) throw error;

  return { id, name, color };
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function getGoalsForWeek(weekId: string): Promise<Goal[]> {
  const { data: goalsData, error: goalsError } = await getSupabase()
    .from('goals')
    .select('*')
    .eq('week_id', weekId)
    .order('priority', { ascending: false })
    .order('created_at');

  if (goalsError) throw goalsError;

  const goals: Goal[] = [];

  for (const row of goalsData || []) {
    const { data: updatesData, error: updatesError } = await getSupabase()
      .from('goal_updates')
      .select('*')
      .eq('goal_id', row.id)
      .order('created_at');

    if (updatesError) throw updatesError;

    goals.push({
      id: row.id,
      title: row.title,
      status: row.status as GoalStatus,
      priority: row.priority as 1 | 2 | 3 | 4 | 5,
      assigneeId: row.assignee_id,
      weekId: row.week_id,
      milestoneId: row.milestone_id || undefined,
      createdAt: row.created_at,
      updates: (updatesData || []).map((u) => ({
        id: u.id,
        content: u.content,
        authorId: u.author_id,
        createdAt: u.created_at,
      })),
    });
  }

  return goals;
}

export async function addGoal(
  title: string,
  assigneeId: string,
  weekId: string,
  priority: 1 | 2 | 3 | 4 | 5 = 3
): Promise<Goal> {
  const id = generateId();

  const { error } = await getSupabase()
    .from('goals')
    .insert({
      id,
      title,
      status: 'not_started',
      priority,
      assignee_id: assigneeId,
      week_id: weekId,
    });

  if (error) throw error;

  return {
    id,
    title,
    status: 'not_started',
    priority,
    assigneeId,
    weekId,
    createdAt: new Date().toISOString(),
    updates: [],
  };
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<Goal, 'title' | 'status' | 'priority'>>
): Promise<void> {
  const updateData: Record<string, string | number> = {};

  if (updates.title !== undefined) {
    updateData.title = updates.title;
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }
  if (updates.priority !== undefined) {
    updateData.priority = updates.priority;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await getSupabase()
      .from('goals')
      .update(updateData)
      .eq('id', goalId);

    if (error) throw error;
  }
}

export async function deleteGoal(goalId: string): Promise<void> {
  // First delete related updates
  await getSupabase()
    .from('goal_updates')
    .delete()
    .eq('goal_id', goalId);

  const { error } = await getSupabase()
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
}

export async function addGoalUpdate(
  goalId: string,
  content: string,
  authorId: string
): Promise<GoalUpdate> {
  const id = generateId();

  const { error } = await getSupabase()
    .from('goal_updates')
    .insert({
      id,
      goal_id: goalId,
      content,
      author_id: authorId,
    });

  if (error) throw error;

  return {
    id,
    content,
    authorId,
    createdAt: new Date().toISOString(),
  };
}

// Milestone functions
export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await getSupabase()
    .from('milestones')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    deadline: row.deadline,
    achieved: row.achieved,
    createdAt: row.created_at,
  }));
}

export async function addMilestone(
  title: string,
  deadline: string
): Promise<Milestone> {
  const id = generateId();

  const { error } = await getSupabase()
    .from('milestones')
    .insert({
      id,
      title,
      deadline,
      achieved: false,
    });

  if (error) throw error;

  return {
    id,
    title,
    deadline,
    achieved: false,
    createdAt: new Date().toISOString(),
  };
}

export async function updateMilestone(
  milestoneId: string,
  updates: Partial<Pick<Milestone, 'title' | 'deadline' | 'achieved'>>
): Promise<void> {
  const updateData: Record<string, string | boolean> = {};

  if (updates.title !== undefined) {
    updateData.title = updates.title;
  }
  if (updates.deadline !== undefined) {
    updateData.deadline = updates.deadline;
  }
  if (updates.achieved !== undefined) {
    updateData.achieved = updates.achieved;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await getSupabase()
      .from('milestones')
      .update(updateData)
      .eq('id', milestoneId);

    if (error) throw error;
  }
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  // First unlink any goals
  await getSupabase()
    .from('goals')
    .update({ milestone_id: null })
    .eq('milestone_id', milestoneId);

  const { error } = await getSupabase()
    .from('milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) throw error;
}

export async function linkGoalToMilestone(
  goalId: string,
  milestoneId: string | null
): Promise<void> {
  const { error } = await getSupabase()
    .from('goals')
    .update({ milestone_id: milestoneId })
    .eq('id', goalId);

  if (error) throw error;
}
