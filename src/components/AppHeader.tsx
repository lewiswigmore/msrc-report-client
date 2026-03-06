'use client';

import { MicrosoftLogo } from './MicrosoftLogo';

interface AppHeaderProps {
  subtitle?: string;
  userName?: string;
  onSignOut?: () => void;
}

export function AppHeader({ subtitle, userName, onSignOut }: AppHeaderProps) {
  return (
    <header className="bg-[var(--ms-header-bg)] text-white min-h-[48px] flex items-center px-4 sm:px-6 justify-between shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 shrink-0">
          <MicrosoftLogo className="w-[20px] h-[20px] sm:w-[23px] sm:h-[23px]" />
          <span className="font-semibold text-[14px] sm:text-[15px] leading-tight">Microsoft</span>
        </div>
        {subtitle && (
          <>
            <div className="h-4 w-px bg-gray-600 mx-1 sm:mx-2 hidden sm:block" />
            <span className="text-[12px] sm:text-[14px] md:text-[15px] hidden sm:block truncate">
              {subtitle}
            </span>
          </>
        )}
      </div>
      {(userName || onSignOut) && (
        <div className="flex items-center gap-2 sm:gap-4 ml-2">
          {userName && (
            <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap hidden sm:block">
              {userName}
            </span>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-xs px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
