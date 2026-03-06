'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { MicrosoftLogo } from './MicrosoftLogo';

export function LoginScreen() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex flex-col">
      <header className="bg-[var(--ms-header-bg)] text-white h-[48px] flex items-center px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <MicrosoftLogo className="w-[20px] h-[20px] sm:w-[23px] sm:h-[23px]" />
          <span className="font-semibold text-[14px] sm:text-[15px]">Microsoft</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg px-6 py-8 sm:px-11 sm:py-11">
            <div className="flex justify-center mb-6">
              <MicrosoftLogo size={80} />
            </div>

            <h1 className="text-2xl font-semibold text-center mb-4 text-[#1f1f1f]">
              MSRC Abuse Report Portal
            </h1>

            <p className="text-center text-[#605e5c] text-sm mb-8 leading-relaxed">
              Sign in with your organizational account to access the MSRC abuse reporting tool.
              Access is restricted to authorized users within your organization.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-[var(--ms-blue)] hover:bg-[#106ebe] text-white py-3 px-4 font-semibold text-[15px] transition-colors duration-150"
            >
              Sign in with Microsoft
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#605e5c]">
                By signing in, you agree to Microsoft&apos;s{' '}
                <a href="https://privacy.microsoft.com/en-us/privacystatement" className="text-[var(--ms-blue)] hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Statement
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#605e5c] border-t border-gray-200 bg-white">
        <div className="flex justify-center gap-4 flex-wrap px-4">
          <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
          <a href="https://www.microsoft.com/en-us/legal/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Use</a>
          <a href="https://go.microsoft.com/fwlink/?LinkId=521839" target="_blank" rel="noopener noreferrer" className="hover:underline">Trademarks</a>
          <span>© {new Date().getFullYear()} Microsoft</span>
        </div>
      </footer>
    </div>
  );
}
