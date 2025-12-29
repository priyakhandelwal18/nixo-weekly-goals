'use client';

interface PriorityStarsProps {
  priority: 1 | 2 | 3 | 4 | 5;
  onChange?: (priority: 1 | 2 | 3 | 4 | 5) => void;
  readonly?: boolean;
}

export function PriorityStars({ priority, onChange, readonly = false }: PriorityStarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => {
            if (!readonly && onChange) {
              onChange(star as 1 | 2 | 3 | 4 | 5);
            }
          }}
          disabled={readonly}
          className={`text-lg ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          {star <= priority ? (
            <span className="text-amber-400">★</span>
          ) : (
            <span className="text-gray-300">☆</span>
          )}
        </button>
      ))}
    </div>
  );
}
