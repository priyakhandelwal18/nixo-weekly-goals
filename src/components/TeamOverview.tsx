'use client';

import { Goal, TeamMember } from '@/types';
import { Avatar } from './Avatar';

interface TeamOverviewProps {
  goals: Goal[];
  teamMembers: TeamMember[];
}

export function TeamOverview({ goals, teamMembers }: TeamOverviewProps) {
  // Group goals by assignee
  const goalsByMember = goals.reduce((acc, goal) => {
    const memberId = goal.assigneeId;
    if (!acc[memberId]) {
      acc[memberId] = [];
    }
    acc[memberId].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Sort goals by priority (high to low)
  Object.values(goalsByMember).forEach((memberGoals) => {
    memberGoals.sort((a, b) => b.priority - a.priority);
  });

  const getMember = (id: string) => teamMembers.find((m) => m.id === id);

  if (goals.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No goals for this week yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {Object.entries(goalsByMember).map(([memberId, memberGoals]) => {
        const member = getMember(memberId);
        if (!member) return null;

        return (
          <div key={memberId} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Avatar name={member.name} color={member.color} size="md" />
              <h2 className="text-lg font-semibold text-blue-600">@{member.name}</h2>
            </div>

            <ul className="list-disc list-inside space-y-2 ml-2">
              {memberGoals.map((goal) => (
                <li key={goal.id} className="text-gray-800">
                  {goal.title}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
