'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/types';
import { PriorityStars } from './PriorityStars';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, assigneeId: string, priority: 1 | 2 | 3 | 4 | 5) => Promise<void>;
  teamMembers: TeamMember[];
  defaultAssigneeId?: string;
}

export function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  teamMembers,
  defaultAssigneeId,
}: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default assignee when modal opens or team members change
  useEffect(() => {
    if (isOpen) {
      const defaultId = defaultAssigneeId || teamMembers[0]?.id || '';
      setAssigneeId(defaultId);
    }
  }, [isOpen, defaultAssigneeId, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title.trim(), assigneeId, priority);
      setTitle('');
      setPriority(3);
      onClose();
    } catch (error) {
      console.error('Failed to add goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Weekly Goal</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Close $10k of sponsorship sales"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Good goals are explicit, quantitative, output-oriented, and achievable this week
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <PriorityStars priority={priority} onChange={setPriority} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !assigneeId || isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
