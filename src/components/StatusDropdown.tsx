'use client';

import { useState, useRef, useEffect } from 'react';
import { GoalStatus, STATUS_LABELS, STATUS_COLORS } from '@/types';

interface StatusDropdownProps {
  status: GoalStatus;
  onChange: (status: GoalStatus) => void;
}

const STATUS_ORDER: GoalStatus[] = [
  'not_started',
  'wip',
  'wip_will_be_done',
  'risky',
  'done',
  'not_done',
];

export function StatusDropdown({ status, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-40">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm ${
                s === status ? 'bg-gray-50' : ''
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]}`} />
              {s === 'risky' && <span className="text-amber-500">⚠</span>}
              <span className="text-gray-700">{STATUS_LABELS[s]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
