'use client';

import { Goal, TeamMember, GoalStatus, Milestone } from '@/types';
import { GoalCard } from './GoalCard';
import { Avatar } from './Avatar';

interface GoalsListProps {
  goals: Goal[];
  teamMembers: TeamMember[];
  selectedMemberId: string | null;
  milestones: Milestone[];
  onUpdateGoalStatus: (goalId: string, status: GoalStatus) => void;
  onUpdateGoalPriority: (goalId: string, priority: 1 | 2 | 3 | 4 | 5) => void;
  onAddGoalUpdate: (goalId: string, content: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onEditGoalTitle: (goalId: string, title: string) => void;
  onLinkGoalToMilestone: (goalId: string, milestoneId: string | null) => void;
}

export function GoalsList({
  goals,
  teamMembers,
  selectedMemberId,
  milestones,
  onUpdateGoalStatus,
  onUpdateGoalPriority,
  onAddGoalUpdate,
  onDeleteGoal,
  onEditGoalTitle,
  onLinkGoalToMilestone,
}: GoalsListProps) {
  // Filter goals based on selected member
  const filteredGoals = selectedMemberId
    ? goals.filter((g) => g.assigneeId === selectedMemberId)
    : goals;

  // Group goals by assignee
  const goalsByMember = filteredGoals.reduce((acc, goal) => {
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

  if (filteredGoals.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No goals for this week yet</p>
          <p className="text-sm mt-1">Add goals using the + button in the sidebar</p>
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
              <h2 className="text-lg font-semibold text-[#c41a76]">@{member.name}</h2>
            </div>

            <ul className="space-y-1">
              {memberGoals.map((goal) => (
                <li key={goal.id}>
                  <GoalCard
                    goal={goal}
                    assignee={member}
                    milestones={milestones}
                    onUpdateStatus={(status) => onUpdateGoalStatus(goal.id, status)}
                    onUpdatePriority={(priority) => onUpdateGoalPriority(goal.id, priority)}
                    onAddUpdate={(content) => onAddGoalUpdate(goal.id, content)}
                    onDelete={() => onDeleteGoal(goal.id)}
                    onEditTitle={(title) => onEditGoalTitle(goal.id, title)}
                    onLinkToMilestone={(milestoneId) => onLinkGoalToMilestone(goal.id, milestoneId)}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
