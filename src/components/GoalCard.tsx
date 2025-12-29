'use client';

import { useState } from 'react';
import { Goal, TeamMember, GoalStatus, STATUS_LABELS, Initiative } from '@/types';
import { Avatar } from './Avatar';
import { StatusDropdown } from './StatusDropdown';
import { PriorityStars } from './PriorityStars';
import { formatDate } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  assignee: TeamMember | undefined;
  initiatives: Initiative[];
  onUpdateStatus: (status: GoalStatus) => void;
  onUpdatePriority: (priority: 1 | 2 | 3 | 4 | 5) => void;
  onAddUpdate: (content: string) => void;
  onDelete: () => void;
  onEditTitle: (title: string) => void;
  onLinkToInitiative: (initiativeId: string | null) => void;
}

export function GoalCard({
  goal,
  assignee,
  initiatives,
  onUpdateStatus,
  onUpdatePriority,
  onAddUpdate,
  onDelete,
  onEditTitle,
  onLinkToInitiative,
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(goal.title);
  const [showMenu, setShowMenu] = useState(false);

  const hasUpdates = goal.updates.length > 0;
  const statusLabel = STATUS_LABELS[goal.status];
  const linkedInitiative = initiatives.find((i) => i.id === goal.initiativeId);

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== goal.title) {
      onEditTitle(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleAddUpdate = () => {
    if (newUpdate.trim()) {
      onAddUpdate(newUpdate.trim());
      setNewUpdate('');
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg mb-3 transition-all ${
        hasUpdates ? 'bg-[#ffbce1]/20 border-[#ffbce1]' : 'bg-white'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <StatusDropdown status={goal.status} onChange={onUpdateStatus} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditedTitle(goal.title);
                      setIsEditing(false);
                    }
                  }}
                  className="flex-1 px-2 py-1 border border-[#c41a76] rounded focus:outline-none focus:ring-2 focus:ring-[#c41a76] text-gray-900"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-medium text-gray-900 cursor-pointer hover:text-[#c41a76]"
                  onClick={() => setIsEditing(true)}
                >
                  {goal.title}
                </h3>
              )}
              {hasUpdates && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-[#c41a76] hover:text-[#a31562] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  ({goal.updates.length})
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#c41a76] hover:text-[#a31562] text-sm"
              >
                Add update
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  goal.status === 'done'
                    ? 'bg-green-100 text-green-700'
                    : goal.status === 'not_done'
                    ? 'bg-red-100 text-red-700'
                    : goal.status === 'wip' || goal.status === 'wip_will_be_done'
                    ? 'bg-blue-100 text-blue-700'
                    : goal.status === 'risky'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {statusLabel}
              </span>
              {assignee && (
                <div className="flex items-center gap-1.5">
                  <Avatar name={assignee.name} color={assignee.color} size="sm" />
                  <span className="text-sm text-gray-600">{assignee.name}</span>
                </div>
              )}
              {linkedInitiative && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#ffbce1]/50 text-[#c41a76]">
                  {linkedInitiative.title}
                </span>
              )}
            </div>
          </div>

          <PriorityStars priority={goal.priority} onChange={onUpdatePriority} />

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-40">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                >
                  Edit title
                </button>
                <div className="border-t border-gray-100 my-1" />
                <div className="px-3 py-1 text-xs text-gray-500 font-medium">Link to Initiative</div>
                <button
                  onClick={() => {
                    onLinkToInitiative(null);
                    setShowMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm ${
                    !goal.initiativeId ? 'text-[#c41a76] font-medium' : 'text-gray-700'
                  }`}
                >
                  None
                </button>
                {initiatives.map((initiative) => (
                  <button
                    key={initiative.id}
                    onClick={() => {
                      onLinkToInitiative(initiative.id);
                      setShowMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm ${
                      goal.initiativeId === initiative.id ? 'text-[#c41a76] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {initiative.title}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                >
                  Delete goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {goal.updates.map((update) => (
            <div key={update.id} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>{formatDate(update.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{update.content}</p>
            </div>
          ))}

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Add an update..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c41a76]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddUpdate();
              }}
            />
            <button
              onClick={handleAddUpdate}
              disabled={!newUpdate.trim()}
              className="px-4 py-2 bg-[#c41a76] text-white rounded-lg text-sm hover:bg-[#a31562] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
