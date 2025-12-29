'use client';

import { Goal, TeamMember } from '@/types';
import { Avatar } from './Avatar';

interface WeekSidebarProps {
  title: string;
  members: TeamMember[];
  goals: Goal[];
}

function getMemberStats(goals: Goal[], memberId: string) {
  const memberGoals = goals.filter((g) => g.assigneeId === memberId);
  const done = memberGoals.filter((g) => g.status === 'done').length;
  const wip = memberGoals.filter((g) => g.status === 'wip' || g.status === 'wip_will_be_done').length;
  const notDone = memberGoals.filter((g) => g.status === 'not_done').length;
  return { done, wip, notDone, total: memberGoals.length };
}

function WeekSidebar({ title, members, goals }: WeekSidebarProps) {
  // Filter to only show members who have goals this week
  const membersWithGoals = members.filter((member) =>
    goals.some((g) => g.assigneeId === member.id)
  );

  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg flex flex-col h-fit">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="font-medium text-sm">{title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {membersWithGoals.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">No goals</div>
        ) : (
          membersWithGoals.map((member) => {
            const stats = getMemberStats(goals, member.id);

            return (
              <div key={member.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} color={member.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {member.name}
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {stats.done > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs">
                          <span className="text-green-600 font-medium">{stats.done}</span>
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      {stats.wip > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs">
                          <span className="text-blue-600 font-medium">{stats.wip}</span>
                          <span className="text-blue-600">→</span>
                        </span>
                      )}
                      {stats.notDone > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs">
                          <span className="text-red-600 font-medium">{stats.notDone}</span>
                          <span className="text-red-600">○</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{stats.total} total</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface TeamOverviewProps {
  goals: Goal[];
  lastWeekGoals: Goal[];
  teamMembers: TeamMember[];
}

export function TeamOverview({ goals, lastWeekGoals, teamMembers }: TeamOverviewProps) {
  // Group current week goals by assignee
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

  return (
    <div className="flex-1 overflow-y-auto p-6 flex gap-6">
      {/* Last Week Sidebar */}
      <WeekSidebar title="Last Week" members={teamMembers} goals={lastWeekGoals} />

      {/* Middle - Goals List */}
      <div className="flex-1 min-w-0">
        {goals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No goals for this week yet</p>
            </div>
          </div>
        ) : (
          Object.entries(goalsByMember).map(([memberId, memberGoals]) => {
            const member = getMember(memberId);
            if (!member) return null;

            return (
              <div key={memberId} className="mb-8">
                <h2 className="text-lg font-semibold text-blue-600 mb-3">@{member.name}</h2>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  {memberGoals.map((goal) => (
                    <li key={goal.id} className="text-gray-800">
                      {goal.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>

      {/* This Week Sidebar */}
      <WeekSidebar title="This Week" members={teamMembers} goals={goals} />
    </div>
  );
}
