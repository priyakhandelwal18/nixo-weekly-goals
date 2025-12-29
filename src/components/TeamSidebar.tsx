'use client';

import { useState } from 'react';
import { TeamMember, Goal, GoalStatus } from '@/types';
import { Avatar } from './Avatar';

interface TeamSidebarProps {
  title: string;
  members: TeamMember[];
  goals: Goal[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
  onAddMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
  showManagement?: boolean;
}

function getMemberStats(goals: Goal[], memberId: string) {
  const memberGoals = goals.filter((g) => g.assigneeId === memberId);
  const done = memberGoals.filter((g) => g.status === 'done').length;
  const wip = memberGoals.filter((g) => g.status === 'wip' || g.status === 'wip_will_be_done').length;
  const notDone = memberGoals.filter((g) => g.status === 'not_done').length;
  return { done, wip, notDone, total: memberGoals.length };
}

export function TeamSidebar({
  title,
  members,
  goals,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  onRemoveMember,
  showManagement = false,
}: TeamSidebarProps) {
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  return (
    <div className="w-64 bg-white border-r border-[#ffbce1]/30 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {showManagement && onAddMember && (
          <button
            onClick={onAddMember}
            className="text-[#c41a76] hover:text-[#a31562] text-sm"
            title="Add team member"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {members.map((member) => {
          const stats = getMemberStats(goals, member.id);
          const isSelected = selectedMemberId === member.id;
          const isHovered = hoveredMemberId === member.id;

          return (
            <div
              key={member.id}
              className={`px-4 py-3 cursor-pointer transition-colors relative ${
                isSelected ? 'bg-[#ffbce1]/20' : 'hover:bg-[#ffbce1]/10'
              }`}
              onClick={() => onSelectMember(isSelected ? null : member.id)}
              onMouseEnter={() => setHoveredMemberId(member.id)}
              onMouseLeave={() => setHoveredMemberId(null)}
            >
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
              {showManagement && isHovered && onRemoveMember && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMember(member.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                  title="Remove team member"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
