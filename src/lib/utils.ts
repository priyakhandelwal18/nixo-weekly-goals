import { Week } from '@/types';

// Week 1 starts on August 4, 2025 (Monday)
const WEEK_1_START = new Date('2025-08-04T00:00:00.000Z');

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getWeekNumber(date: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diffMs = date.getTime() - WEEK_1_START.getTime();
  const weekNum = Math.floor(diffMs / msPerWeek) + 1;
  return weekNum;
}

export function getWeekDates(weekNumber: number): { start: Date; end: Date } {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const start = new Date(WEEK_1_START.getTime() + (weekNumber - 1) * msPerWeek);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCurrentWeek(): Week {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const { start, end } = getWeekDates(weekNumber);

  return {
    id: `W${weekNumber}`,
    weekNumber,
    year: start.getFullYear(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function getWeekFromId(weekId: string): Week {
  // Handle both old format (2025-W01) and new format (W1)
  let weekNumber: number;
  if (weekId.includes('-W')) {
    weekNumber = parseInt(weekId.split('-W')[1], 10);
  } else {
    weekNumber = parseInt(weekId.replace('W', ''), 10);
  }

  const { start, end } = getWeekDates(weekNumber);

  return {
    id: `W${weekNumber}`,
    weekNumber,
    year: start.getFullYear(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function getAdjacentWeek(weekId: string, direction: 'prev' | 'next'): string {
  const week = getWeekFromId(weekId);
  const newWeekNumber = week.weekNumber + (direction === 'next' ? 1 : -1);

  // Don't go below week 1
  if (newWeekNumber < 1) {
    return weekId;
  }

  return `W${newWeekNumber}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AVATAR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];
