'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/types';

interface AddInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, deadline: string, assigneeId: string) => Promise<void>;
  teamMembers: TeamMember[];
}

export function AddInitiativeModal({
  isOpen,
  onClose,
  onAdd,
  teamMembers,
}: AddInitiativeModalProps) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssigneeId(teamMembers[0]?.id || '');
      // Default deadline to 2 weeks from now
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setDeadline(twoWeeksFromNow.toISOString().split('T')[0]);
    }
  }, [isOpen, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline || !assigneeId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title.trim(), deadline, assigneeId);
      setTitle('');
      setDeadline('');
      onClose();
    } catch (error) {
      console.error('Failed to add initiative:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Initiative</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initiative Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Launch v2.0 of the product"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41a76]"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Initiatives are bigger goals with deadlines that weekly goals can contribute to
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41a76]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41a76]"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
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
              disabled={!title.trim() || !deadline || !assigneeId || isSubmitting}
              className="px-4 py-2 bg-[#c41a76] text-white rounded-lg hover:bg-[#a31562] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Initiative'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
