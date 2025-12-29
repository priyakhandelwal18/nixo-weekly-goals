'use client';

import { useState } from 'react';
import { Initiative, Goal, TeamMember } from '@/types';
import { Avatar } from './Avatar';

interface InitiativesListProps {
  initiatives: Initiative[];
  goals: Goal[];
  teamMembers: TeamMember[];
  onToggleAchieved: (initiativeId: string, achieved: boolean) => void;
  onDeleteInitiative: (initiativeId: string) => void;
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string): boolean {
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
}

function getDaysUntil(dateStr: string): number {
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function InitiativesList({
  initiatives,
  goals,
  teamMembers,
  onToggleAchieved,
  onDeleteInitiative,
}: InitiativesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getMember = (id: string) => teamMembers.find((m) => m.id === id);

  const getLinkedGoals = (initiative: Initiative): Goal[] => {
    return goals.filter((g) => g.initiativeId === initiative.id);
  };

  if (initiatives.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No initiatives yet</p>
          <p className="text-sm mt-1">Add an initiative to track bigger goals with deadlines</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-200" />

          {initiatives.map((initiative, index) => {
            const member = getMember(initiative.assigneeId);
            const linkedGoals = getLinkedGoals(initiative);
            const isExpanded = expandedId === initiative.id;
            const overdue = isOverdue(initiative.deadline) && !initiative.achieved;
            const daysUntil = getDaysUntil(initiative.deadline);

            return (
              <div key={initiative.id} className="relative pl-12 pb-8">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 w-5 h-5 rounded-full border-2 border-white ${
                    initiative.achieved
                      ? 'bg-green-500'
                      : overdue
                      ? 'bg-red-500'
                      : 'bg-[#c41a76]'
                  }`}
                />

                {/* Initiative Card */}
                <div
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition-shadow hover:shadow-md ${
                    initiative.achieved ? 'border-green-200' : overdue ? 'border-red-200' : 'border-gray-200'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : initiative.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`font-medium text-lg ${
                            initiative.achieved ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {initiative.title}
                        </h3>
                        {initiative.achieved && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Achieved
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className={`flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDeadline(initiative.deadline)}</span>
                          {!initiative.achieved && (
                            <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                              ({overdue ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil} days left`})
                            </span>
                          )}
                        </div>

                        {member && (
                          <div className="flex items-center gap-1">
                            <Avatar name={member.name} color={member.color} size="sm" />
                            <span className="text-gray-600">{member.name}</span>
                          </div>
                        )}

                        {linkedGoals.length > 0 && (
                          <span className="text-gray-500">
                            {linkedGoals.length} linked goal{linkedGoals.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleAchieved(initiative.id, !initiative.achieved);
                        }}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          initiative.achieved
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-[#c41a76] text-white hover:bg-[#a31562]'
                        }`}
                      >
                        {initiative.achieved ? 'Mark Not Achieved' : 'Mark Achieved'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this initiative?')) {
                            onDeleteInitiative(initiative.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete initiative"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded: Show linked goals */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Linked Weekly Goals</h4>
                      {linkedGoals.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No goals linked yet. Link goals from the Detailed view.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {linkedGoals.map((goal) => {
                            const goalMember = getMember(goal.assigneeId);
                            return (
                              <div
                                key={goal.id}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    goal.status === 'done'
                                      ? 'bg-green-500'
                                      : goal.status === 'not_done'
                                      ? 'bg-red-500'
                                      : goal.status === 'wip' || goal.status === 'wip_will_be_done'
                                      ? 'bg-blue-500'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <span className="flex-1 text-sm text-gray-800">{goal.title}</span>
                                {goalMember && (
                                  <div className="flex items-center gap-1">
                                    <Avatar name={goalMember.name} color={goalMember.color} size="sm" />
                                    <span className="text-xs text-gray-500">{goalMember.name}</span>
                                  </div>
                                )}
                                <span className="text-xs text-gray-400">{goal.weekId}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
