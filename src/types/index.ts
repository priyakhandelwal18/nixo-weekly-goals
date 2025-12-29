export type GoalStatus =
  | 'not_started'
  | 'wip'
  | 'wip_will_be_done'
  | 'risky'
  | 'done'
  | 'not_done';

export interface Goal {
  id: string;
  title: string;
  status: GoalStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  assigneeId: string;
  weekId: string;
  initiativeId?: string;
  updates: GoalUpdate[];
  createdAt: string;
}

export interface GoalUpdate {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface Week {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
}

export interface Initiative {
  id: string;
  title: string;
  deadline: string;
  assigneeId: string;
  achieved: boolean;
  linkedGoalIds: string[];
  createdAt: string;
}

export interface AppData {
  teamMembers: TeamMember[];
  goals: Goal[];
  weeks: Week[];
  initiatives: Initiative[];
}

export const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Not started',
  wip: 'WIP',
  wip_will_be_done: 'WIP - Will be done',
  risky: 'Risky',
  done: 'Done',
  not_done: 'Not done',
};

export const STATUS_COLORS: Record<GoalStatus, string> = {
  not_started: 'bg-gray-400',
  wip: 'bg-blue-500',
  wip_will_be_done: 'bg-blue-500',
  risky: 'bg-amber-500',
  done: 'bg-green-500',
  not_done: 'bg-red-500',
};
