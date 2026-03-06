'use client';

export interface Notification {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

const STYLE_MAP: Record<Notification['type'], { bg: string; border: string; text: string; dismiss: string }> = {
  error:   { bg: 'bg-red-50',    border: 'border-red-500',    text: 'text-red-800',    dismiss: 'text-red-500 hover:text-red-700' },
  success: { bg: 'bg-green-50',  border: 'border-green-500',  text: 'text-green-800',  dismiss: 'text-green-500 hover:text-green-700' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-800', dismiss: 'text-yellow-500 hover:text-yellow-700' },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-500',   text: 'text-blue-800',   dismiss: 'text-blue-500 hover:text-blue-700' },
};

const ICON_PATHS: Record<Notification['type'], { color: string; d: string }> = {
  error: {
    color: 'text-red-500',
    d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
  },
  success: {
    color: 'text-green-500',
    d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
  },
  warning: {
    color: 'text-yellow-500',
    d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
  },
  info: {
    color: 'text-blue-500',
    d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
  },
};

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const style = STYLE_MAP[notification.type];
  const icon = ICON_PATHS[notification.type];

  return (
    <div className="fixed top-14 sm:top-20 right-4 sm:right-6 z-50 max-w-[calc(100%-2rem)] sm:max-w-sm w-full sm:w-auto animate-slide-in">
      <div className={`rounded-sm shadow-lg border-l-4 p-4 flex items-start gap-3 ${style.bg} ${style.border}`}>
        <div className="shrink-0">
          <svg className={`w-5 h-5 ${icon.color}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d={icon.d} clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.text}`}>{notification.message}</p>
        </div>
        <button onClick={onDismiss} className={`shrink-0 ${style.dismiss}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
