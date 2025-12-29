import { Week } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function getWeekDates(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
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
  const { start, end } = getWeekDates(now);

  return {
    id: `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`,
    weekNumber,
    year: now.getFullYear(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function getWeekFromId(weekId: string): Week {
  const [year, weekPart] = weekId.split('-W');
  const weekNumber = parseInt(weekPart, 10);

  const jan1 = new Date(parseInt(year, 10), 0, 1);
  const daysToAdd = (weekNumber - 1) * 7 - jan1.getDay() + 1;
  const weekStart = new Date(jan1);
  weekStart.setDate(jan1.getDate() + daysToAdd);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    id: weekId,
    weekNumber,
    year: parseInt(year, 10),
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  };
}

export function getAdjacentWeek(weekId: string, direction: 'prev' | 'next'): string {
  const week = getWeekFromId(weekId);
  const date = new Date(week.startDate);
  date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));

  const newWeekNumber = getWeekNumber(date);
  return `${date.getFullYear()}-W${newWeekNumber.toString().padStart(2, '0')}`;
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
