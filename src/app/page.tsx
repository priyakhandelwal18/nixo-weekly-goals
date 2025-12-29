'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeamMember, Goal, GoalStatus, Initiative } from '@/types';
import { getCurrentWeek, getWeekFromId, getAdjacentWeek } from '@/lib/utils';
import { TeamSidebar } from '@/components/TeamSidebar';
import { GoalsList } from '@/components/GoalsList';
import { WeekSelector } from '@/components/WeekSelector';
import { AddGoalModal } from '@/components/AddGoalModal';
import { AddMemberModal } from '@/components/AddMemberModal';
import { AddInitiativeModal } from '@/components/AddInitiativeModal';
import { LoginPage } from '@/components/LoginPage';
import { OverviewList } from '@/components/OverviewList';
import { InitiativesList } from '@/components/InitiativesList';

type ViewMode = 'detailed' | 'overview' | 'initiatives';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [lastWeekGoals, setLastWeekGoals] = useState<Goal[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddInitiativeModal, setShowAddInitiativeModal] = useState(false);
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
      const [membersRes, goalsRes, lastWeekGoalsRes, initiativesRes] = await Promise.all([
        fetch('/api/team-members'),
        fetch(`/api/goals?weekId=${currentWeekId}`),
        fetch(`/api/goals?weekId=${lastWeekId}`),
        fetch('/api/initiatives'),
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

      if (initiativesRes.ok) {
        const initiativesData = await initiativesRes.json();
        setInitiatives(initiativesData);
      }

      // Load all goals for initiative linking display
      const allGoalsRes = await fetch('/api/goals/all');
      if (allGoalsRes.ok) {
        const allGoalsData = await allGoalsRes.json();
        setAllGoals(allGoalsData);
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

  const handleLinkGoalToInitiative = async (goalId: string, initiativeId: string | null) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, initiativeId }),
      });

      if (res.ok) {
        setGoals(goals.map((g) => (g.id === goalId ? { ...g, initiativeId: initiativeId || undefined } : g)));
        setAllGoals(allGoals.map((g) => (g.id === goalId ? { ...g, initiativeId: initiativeId || undefined } : g)));
      }
    } catch (error) {
      console.error('Failed to link goal to initiative:', error);
    }
  };

  const handleSelectWeek = (weekId: string) => {
    setCurrentWeekId(weekId);
    setLoading(true);
  };

  // Initiative handlers
  const handleAddInitiative = async (title: string, deadline: string, assigneeId: string) => {
    try {
      const res = await fetch('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, deadline, assigneeId }),
      });

      if (res.ok) {
        const newInitiative = await res.json();
        setInitiatives([...initiatives, newInitiative]);
      } else {
        const errorData = await res.json();
        console.error('Failed to add initiative:', errorData);
        alert(`Failed to add initiative: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add initiative:', error);
      alert('Failed to add initiative. Please try again.');
    }
  };

  const handleToggleInitiativeAchieved = async (initiativeId: string, achieved: boolean) => {
    try {
      const res = await fetch('/api/initiatives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiativeId, achieved }),
      });

      if (res.ok) {
        setInitiatives(initiatives.map((i) => (i.id === initiativeId ? { ...i, achieved } : i)));
      }
    } catch (error) {
      console.error('Failed to update initiative:', error);
    }
  };

  const handleDeleteInitiative = async (initiativeId: string) => {
    try {
      const res = await fetch(`/api/initiatives?id=${initiativeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInitiatives(initiatives.filter((i) => i.id !== initiativeId));
      }
    } catch (error) {
      console.error('Failed to delete initiative:', error);
    }
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c41a76]"></div>
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
    <div className="min-h-screen bg-white flex">
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
                    ? 'text-[#c41a76]'
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
            <div className="flex bg-[#ffbce1]/30 rounded-lg p-1">
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
              <button
                onClick={() => setViewMode('initiatives')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'initiatives'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Initiatives
              </button>
            </div>

            {viewMode === 'initiatives' ? (
              <button
                onClick={() => setShowAddInitiativeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c41a76] text-white rounded-lg hover:bg-[#a31562] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Initiative
              </button>
            ) : (
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c41a76] text-white rounded-lg hover:bg-[#a31562] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Goal
              </button>
            )}

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c41a76]"></div>
          </div>
        ) : viewMode === 'initiatives' ? (
          <InitiativesList
            initiatives={initiatives}
            goals={allGoals}
            teamMembers={teamMembers}
            onToggleAchieved={handleToggleInitiativeAchieved}
            onDeleteInitiative={handleDeleteInitiative}
          />
        ) : viewMode === 'overview' ? (
          <OverviewList goals={goals} teamMembers={teamMembers} />
        ) : (
          <GoalsList
            goals={goals}
            teamMembers={teamMembers}
            selectedMemberId={selectedMemberId}
            initiatives={initiatives}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onUpdateGoalPriority={handleUpdateGoalPriority}
            onAddGoalUpdate={handleAddGoalUpdate}
            onDeleteGoal={handleDeleteGoal}
            onEditGoalTitle={handleEditGoalTitle}
            onLinkGoalToInitiative={handleLinkGoalToInitiative}
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

      <AddInitiativeModal
        isOpen={showAddInitiativeModal}
        onClose={() => setShowAddInitiativeModal(false)}
        onAdd={handleAddInitiative}
        teamMembers={teamMembers}
      />
    </div>
  );
}
