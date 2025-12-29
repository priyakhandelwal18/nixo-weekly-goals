import { AppData, TeamMember, Goal, Week } from '@/types';
import { generateId, getCurrentWeek, AVATAR_COLORS } from './utils';

const STORAGE_KEY = 'nixo-weekly-goals';

function getDefaultData(): AppData {
  const currentWeek = getCurrentWeek();

  return {
    teamMembers: [
      { id: generateId(), name: 'Shrey Kohli', color: AVATAR_COLORS[0] },
    ],
    goals: [],
    weeks: [currentWeek],
    initiatives: [],
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }

  return getDefaultData();
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function addTeamMember(data: AppData, name: string): AppData {
  const colorIndex = data.teamMembers.length % AVATAR_COLORS.length;
  const newMember: TeamMember = {
    id: generateId(),
    name,
    color: AVATAR_COLORS[colorIndex],
  };

  const newData = {
    ...data,
    teamMembers: [...data.teamMembers, newMember],
  };

  saveData(newData);
  return newData;
}

export function removeTeamMember(data: AppData, memberId: string): AppData {
  const newData = {
    ...data,
    teamMembers: data.teamMembers.filter((m) => m.id !== memberId),
    goals: data.goals.filter((g) => g.assigneeId !== memberId),
  };

  saveData(newData);
  return newData;
}

export function addGoal(
  data: AppData,
  title: string,
  assigneeId: string,
  weekId: string,
  priority: 1 | 2 | 3 | 4 | 5 = 3
): AppData {
  const newGoal: Goal = {
    id: generateId(),
    title,
    status: 'not_started',
    priority,
    assigneeId,
    weekId,
    updates: [],
    createdAt: new Date().toISOString(),
  };

  // Ensure the week exists
  let weeks = data.weeks;
  if (!weeks.find((w) => w.id === weekId)) {
    const [year, weekPart] = weekId.split('-W');
    const weekNumber = parseInt(weekPart, 10);
    weeks = [
      ...weeks,
      {
        id: weekId,
        weekNumber,
        year: parseInt(year, 10),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
    ];
  }

  const newData = {
    ...data,
    goals: [...data.goals, newGoal],
    weeks,
  };

  saveData(newData);
  return newData;
}

export function updateGoal(data: AppData, goalId: string, updates: Partial<Goal>): AppData {
  const newData = {
    ...data,
    goals: data.goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
  };

  saveData(newData);
  return newData;
}

export function deleteGoal(data: AppData, goalId: string): AppData {
  const newData = {
    ...data,
    goals: data.goals.filter((g) => g.id !== goalId),
  };

  saveData(newData);
  return newData;
}

export function addGoalUpdate(
  data: AppData,
  goalId: string,
  content: string,
  authorId: string
): AppData {
  const newData = {
    ...data,
    goals: data.goals.map((g) =>
      g.id === goalId
        ? {
            ...g,
            updates: [
              ...g.updates,
              {
                id: generateId(),
                content,
                authorId,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : g
    ),
  };

  saveData(newData);
  return newData;
}

export function getGoalsForWeek(data: AppData, weekId: string): Goal[] {
  return data.goals.filter((g) => g.weekId === weekId);
}

export function getGoalsForMember(data: AppData, memberId: string, weekId: string): Goal[] {
  return data.goals.filter((g) => g.assigneeId === memberId && g.weekId === weekId);
}

export function getMemberStats(
  data: AppData,
  memberId: string,
  weekId: string
): { done: number; total: number } {
  const goals = getGoalsForMember(data, memberId, weekId);
  const done = goals.filter((g) => g.status === 'done').length;
  return { done, total: goals.length };
}
