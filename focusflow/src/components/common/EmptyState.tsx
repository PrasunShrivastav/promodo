import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-3xl bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3 ${className}`}>
      {icon && <div className="flex justify-center text-zinc-400">{icon}</div>}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h4>
        {description && <p className="text-xs text-zinc-400 max-w-sm mx-auto">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-xs hover:bg-rose-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
