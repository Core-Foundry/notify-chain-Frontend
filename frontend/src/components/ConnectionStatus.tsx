'use client';

import { useWebSocket, ConnectionState } from '@/src/lib/useWebSocket';
import { cn } from '@/src/lib/utils';

interface ConnectionStatusProps {
  wsUrl: string;
}

const statusConfig: Record<ConnectionState, {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
}> = {
  connected: {
    label: 'Connected',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-900/30',
    icon: '●',
  },
  reconnecting: {
    label: 'Reconnecting',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-900/30',
    icon: '↻',
  },
  offline: {
    label: 'Offline',
    dotColor: 'bg-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    textColor: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-900/30',
    icon: '✕',
  },
};

export function ConnectionStatus({ wsUrl }: ConnectionStatusProps) {
  const { connectionState, reconnectAttempt } = useWebSocket({
    url: wsUrl,
  });

  const config = statusConfig[connectionState];
  const isRetrying = connectionState === 'reconnecting';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-300',
        config.bgColor,
        config.borderColor,
        config.textColor
      )}
      role="status"
      aria-live="polite"
    >
      {/* Animated Status Dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            config.dotColor,
            isRetrying && 'animate-ping'
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            config.dotColor,
            connectionState === 'offline' && 'opacity-50'
          )}
        />
      </span>

      {/* Status Text */}
      <span>{config.label}</span>

      {/* Retry Counter (only shown when reconnecting) */}
      {isRetrying && (
        <span className="text-xs opacity-70">
          ({reconnectAttempt}/5)
        </span>
      )}
    </div>
  );
}
