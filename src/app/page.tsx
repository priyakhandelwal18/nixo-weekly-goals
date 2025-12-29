'use client';

import { useState, useEffect } from 'react';
import { AppData, GoalStatus } from '@/types';
import {
  loadData,
  saveData,
  addTeamMember,
  removeTeamMember,
  addGoal,
  updateGoal,
  deleteGoal,
  addGoalUpdate,
} from '@/lib/storage';
import { getCurrentWeek, getWeekFromId } from '@/lib/utils';
import { TeamSidebar } from '@/components/TeamSidebar';
import { GoalsList } from '@/components/GoalsList';
import { WeekSelector } from '@/components/WeekSelector';
import { AddGoalModal } from '@/components/AddGoalModal';
import { AddMemberModal } from '@/components/AddMemberModal';

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setCurrentWeekId(getCurrentWeek().id);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentWeek = getWeekFromId(currentWeekId);
  const weeksWithCurrent = data.weeks.find((w) => w.id === currentWeekId)
    ? data.weeks
    : [...data.weeks, currentWeek];

  const goalsForWeek = data.goals.filter((g) => g.weekId === currentWeekId);

  const handleAddMember = (name: string) => {
    const newData = addTeamMember(data, name);
    setData(newData);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member? Their goals will also be removed.')) {
      const newData = removeTeamMember(data, memberId);
      setData(newData);
      if (selectedMemberId === memberId) {
        setSelectedMemberId(null);
      }
    }
  };

  const handleAddGoal = (title: string, assigneeId: string, priority: 1 | 2 | 3 | 4 | 5) => {
    const newData = addGoal(data, title, assigneeId, currentWeekId, priority);
    setData(newData);
  };

  const handleUpdateGoalStatus = (goalId: string, status: GoalStatus) => {
    const newData = updateGoal(data, goalId, { status });
    setData(newData);
  };

  const handleUpdateGoalPriority = (goalId: string, priority: 1 | 2 | 3 | 4 | 5) => {
    const newData = updateGoal(data, goalId, { priority });
    setData(newData);
  };

  const handleAddGoalUpdate = (goalId: string, content: string) => {
    const goal = data.goals.find((g) => g.id === goalId);
    if (goal) {
      const newData = addGoalUpdate(data, goalId, content, goal.assigneeId);
      setData(newData);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const newData = deleteGoal(data, goalId);
      setData(newData);
    }
  };

  const handleEditGoalTitle = (goalId: string, title: string) => {
    const newData = updateGoal(data, goalId, { title });
    setData(newData);
  };

  const handleSelectWeek = (weekId: string) => {
    setCurrentWeekId(weekId);
    // Ensure the week exists in data
    if (!data.weeks.find((w) => w.id === weekId)) {
      const week = getWeekFromId(weekId);
      const newData = { ...data, weeks: [...data.weeks, week] };
      saveData(newData);
      setData(newData);
    }
  };

  // Calculate completion stats
  const totalGoals = goalsForWeek.length;
  const doneGoals = goalsForWeek.filter((g) => g.status === 'done').length;
  const completionRate = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - This Week */}
      <TeamSidebar
        title="This Week"
        members={data.teamMembers}
        goals={goalsForWeek}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onAddMember={() => setShowAddMemberModal(true)}
        onRemoveMember={handleRemoveMember}
        showManagement={true}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <WeekSelector
          currentWeekId={currentWeekId}
          weeks={weeksWithCurrent}
          onSelectWeek={handleSelectWeek}
        />

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total Goals:</span>
              <span className="font-semibold text-gray-900">{totalGoals}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Completed:</span>
              <span className="font-semibold text-green-600">{doneGoals}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Completion Rate:</span>
              <span
                className={`font-semibold ${
                  completionRate >= 50 && completionRate <= 70
                    ? 'text-green-600'
                    : completionRate > 70
                    ? 'text-blue-600'
                    : 'text-amber-600'
                }`}
              >
                {completionRate}%
              </span>
              {completionRate >= 50 && completionRate <= 70 && (
                <span className="text-xs text-gray-500">(Sweet spot!)</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowAddGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Goal
          </button>
        </div>

        <GoalsList
          goals={goalsForWeek}
          teamMembers={data.teamMembers}
          selectedMemberId={selectedMemberId}
          onUpdateGoalStatus={handleUpdateGoalStatus}
          onUpdateGoalPriority={handleUpdateGoalPriority}
          onAddGoalUpdate={handleAddGoalUpdate}
          onDeleteGoal={handleDeleteGoal}
          onEditGoalTitle={handleEditGoalTitle}
        />
      </div>

      {/* Modals */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onAdd={handleAddGoal}
        teamMembers={data.teamMembers}
        defaultAssigneeId={selectedMemberId || undefined}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
}
