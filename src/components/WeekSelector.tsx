'use client';

import { Week } from '@/types';
import { formatDate, getAdjacentWeek, getCurrentWeek } from '@/lib/utils';

interface WeekSelectorProps {
  currentWeekId: string;
  weeks: Week[];
  onSelectWeek: (weekId: string) => void;
}

export function WeekSelector({ currentWeekId, weeks, onSelectWeek }: WeekSelectorProps) {
  const currentWeek = weeks.find((w) => w.id === currentWeekId);
  const todayWeek = getCurrentWeek();
  const isCurrentWeek = currentWeekId === todayWeek.id;

  const handlePrevWeek = () => {
    const prevWeekId = getAdjacentWeek(currentWeekId, 'prev');
    onSelectWeek(prevWeekId);
  };

  const handleNextWeek = () => {
    const nextWeekId = getAdjacentWeek(currentWeekId, 'next');
    onSelectWeek(nextWeekId);
  };

  const handleGoToCurrentWeek = () => {
    onSelectWeek(todayWeek.id);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Previous week"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1 className="text-xl font-semibold text-blue-600">
            Week {currentWeek?.weekNumber || ''}
          </h1>
          {currentWeek && (
            <p className="text-sm text-gray-500">
              {formatDate(currentWeek.startDate)} – {formatDate(currentWeek.endDate)}
            </p>
          )}
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Next week"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!isCurrentWeek && (
        <button
          onClick={handleGoToCurrentWeek}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span>Current Week</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
