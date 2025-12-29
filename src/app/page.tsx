'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeamMember, Goal, GoalStatus } from '@/types';
import { getCurrentWeek, getWeekFromId, getAdjacentWeek } from '@/lib/utils';
import { TeamSidebar } from '@/components/TeamSidebar';
import { GoalsList } from '@/components/GoalsList';
import { WeekSelector } from '@/components/WeekSelector';
import { AddGoalModal } from '@/components/AddGoalModal';
import { AddMemberModal } from '@/components/AddMemberModal';
import { LoginPage } from '@/components/LoginPage';
import { OverviewList } from '@/components/OverviewList';

type ViewMode = 'detailed' | 'overview';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [lastWeekGoals, setLastWeekGoals] = useState<Goal[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Load data when authenticated
  const loadData = useCallback(async () => {
    if (!currentWeekId) return;

    const lastWeekId = getAdjacentWeek(currentWeekId, 'prev');

    try {
      const [membersRes, goalsRes, lastWeekGoalsRes] = await Promise.all([
        fetch('/api/team-members'),
        fetch(`/api/goals?weekId=${currentWeekId}`),
        fetch(`/api/goals?weekId=${lastWeekId}`),
      ]);

      if (membersRes.ok && goalsRes.ok) {
        const members = await membersRes.json();
        const goalsData = await goalsRes.json();
        setTeamMembers(members);
        setGoals(goalsData);
      }

      if (lastWeekGoalsRes.ok) {
        const lastWeekGoalsData = await lastWeekGoalsRes.json();
        setLastWeekGoals(lastWeekGoalsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeekId]);

  useEffect(() => {
    if (isAuthenticated && currentWeekId) {
      loadData();
    }
  }, [isAuthenticated, currentWeekId, loadData]);

  useEffect(() => {
    setCurrentWeekId(getCurrentWeek().id);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const handleAddMember = async (name: string) => {
    try {
      const res = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const newMember = await res.json();
        setTeamMembers([...teamMembers, newMember]);
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member? Their goals will also be removed.')) {
      return;
    }

    try {
      const res = await fetch(`/api/team-members?id=${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
        setGoals(goals.filter((g) => g.assigneeId !== memberId));
        if (selectedMemberId === memberId) {
          setSelectedMemberId(null);
        }
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleAddGoal = async (title: string, assigneeId: string, priority: 1 | 2 | 3 | 4 | 5) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, assigneeId, weekId: currentWeekId, priority }),
      });

      if (res.ok) {
        const newGoal = await res.json();
        setGoals([...goals, newGoal]);
      } else {
        const errorData = await res.json();
        console.error('Failed to add goal:', errorData);
        alert(`Failed to add goal: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const handleUpdateGoalStatus = async (goalId: string, status: GoalStatus) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, status }),
      });

      if (res.ok) {
        setGoals(goals.map((g) => (g.id === goalId ? { ...g, status } : g)));
      }
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const handleUpdateGoalPriority = async (goalId: string, priority: 1 | 2 | 3 | 4 | 5) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, priority }),
      });

      if (res.ok) {
        setGoals(goals.map((g) => (g.id === goalId ? { ...g, priority } : g)));
      }
    } catch (error) {
      console.error('Failed to update goal priority:', error);
    }
  };

  const handleAddGoalUpdate = async (goalId: string, content: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    try {
      const res = await fetch('/api/goals/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, content, authorId: goal.assigneeId }),
      });

      if (res.ok) {
        const newUpdate = await res.json();
        setGoals(
          goals.map((g) =>
            g.id === goalId ? { ...g, updates: [...g.updates, newUpdate] } : g
          )
        );
      }
    } catch (error) {
      console.error('Failed to add goal update:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const res = await fetch(`/api/goals?id=${goalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setGoals(goals.filter((g) => g.id !== goalId));
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleEditGoalTitle = async (goalId: string, title: string) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, title }),
      });

      if (res.ok) {
        setGoals(goals.map((g) => (g.id === goalId ? { ...g, title } : g)));
      }
    } catch (error) {
      console.error('Failed to update goal title:', error);
    }
  };

  const handleSelectWeek = (weekId: string) => {
    setCurrentWeekId(weekId);
    setLoading(true);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentWeek = getWeekFromId(currentWeekId);

  // Calculate completion stats
  const totalGoals = goals.length;
  const doneGoals = goals.filter((g) => g.status === 'done').length;
  const completionRate = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Last Week (read-only) */}
      <TeamSidebar
        title="Last Week"
        members={teamMembers}
        goals={lastWeekGoals}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        showManagement={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <WeekSelector
          currentWeekId={currentWeekId}
          weeks={[currentWeek]}
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

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
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

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'overview' ? (
          <OverviewList goals={goals} teamMembers={teamMembers} />
        ) : (
          <GoalsList
            goals={goals}
            teamMembers={teamMembers}
            selectedMemberId={selectedMemberId}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onUpdateGoalPriority={handleUpdateGoalPriority}
            onAddGoalUpdate={handleAddGoalUpdate}
            onDeleteGoal={handleDeleteGoal}
            onEditGoalTitle={handleEditGoalTitle}
          />
        )}
      </div>

      {/* Right Sidebar - This Week (with management) */}
      <TeamSidebar
        title="This Week"
        members={teamMembers}
        goals={goals}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onAddMember={() => setShowAddMemberModal(true)}
        onRemoveMember={handleRemoveMember}
        showManagement={true}
      />

      {/* Modals */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onAdd={handleAddGoal}
        teamMembers={teamMembers}
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
