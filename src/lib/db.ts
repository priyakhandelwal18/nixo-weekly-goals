import { sql } from '@vercel/postgres';
import { TeamMember, Goal, GoalStatus, GoalUpdate } from '@/types';
import { generateId, AVATAR_COLORS } from './utils';

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id VARCHAR(255) PRIMARY KEY,
      title TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'not_started',
      priority INTEGER NOT NULL DEFAULT 3,
      assignee_id VARCHAR(255) NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      week_id VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS goal_updates (
      id VARCHAR(255) PRIMARY KEY,
      goal_id VARCHAR(255) NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for faster queries
  await sql`CREATE INDEX IF NOT EXISTS idx_goals_week ON goals(week_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_goals_assignee ON goals(assignee_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_updates_goal ON goal_updates(goal_id)`;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const result = await sql`SELECT * FROM team_members ORDER BY created_at`;
  return result.rows.map((row) => ({
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

  await sql`
    INSERT INTO team_members (id, name, color)
    VALUES (${id}, ${name}, ${color})
  `;

  return { id, name, color };
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await sql`DELETE FROM team_members WHERE id = ${memberId}`;
}

export async function getGoalsForWeek(weekId: string): Promise<Goal[]> {
  const goalsResult = await sql`
    SELECT * FROM goals WHERE week_id = ${weekId} ORDER BY priority DESC, created_at
  `;

  const goals: Goal[] = [];

  for (const row of goalsResult.rows) {
    const updatesResult = await sql`
      SELECT * FROM goal_updates WHERE goal_id = ${row.id} ORDER BY created_at
    `;

    goals.push({
      id: row.id,
      title: row.title,
      status: row.status as GoalStatus,
      priority: row.priority as 1 | 2 | 3 | 4 | 5,
      assigneeId: row.assignee_id,
      weekId: row.week_id,
      createdAt: row.created_at,
      updates: updatesResult.rows.map((u) => ({
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

  await sql`
    INSERT INTO goals (id, title, status, priority, assignee_id, week_id)
    VALUES (${id}, ${title}, 'not_started', ${priority}, ${assigneeId}, ${weekId})
  `;

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
  if (updates.title !== undefined) {
    await sql`UPDATE goals SET title = ${updates.title} WHERE id = ${goalId}`;
  }
  if (updates.status !== undefined) {
    await sql`UPDATE goals SET status = ${updates.status} WHERE id = ${goalId}`;
  }
  if (updates.priority !== undefined) {
    await sql`UPDATE goals SET priority = ${updates.priority} WHERE id = ${goalId}`;
  }
}

export async function deleteGoal(goalId: string): Promise<void> {
  await sql`DELETE FROM goals WHERE id = ${goalId}`;
}

export async function addGoalUpdate(
  goalId: string,
  content: string,
  authorId: string
): Promise<GoalUpdate> {
  const id = generateId();

  await sql`
    INSERT INTO goal_updates (id, goal_id, content, author_id)
    VALUES (${id}, ${goalId}, ${content}, ${authorId})
  `;

  return {
    id,
    content,
    authorId,
    createdAt: new Date().toISOString(),
  };
}
