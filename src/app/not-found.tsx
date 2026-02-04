import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--ms-header-bg)] text-white h-[48px] flex items-center px-6">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 23 23" className="w-[23px] h-[23px]" aria-label="Microsoft Logo">
            <rect x="0" y="0" width="10" height="10" fill="#f25022"></rect>
            <rect x="12" y="0" width="10" height="10" fill="#7fba00"></rect>
            <rect x="0" y="12" width="10" height="10" fill="#00a4ef"></rect>
            <rect x="12" y="12" width="10" height="10" fill="#ffb900"></rect>
          </svg>
          <span className="font-semibold text-[15px]">Microsoft</span>
          <div className="h-4 w-px bg-gray-600 mx-2"></div>
          <span className="text-[15px]">Security Response Center</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#f8f8f8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Report Abuse
            </Link>
            <Link
              href="/security"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Security Updates
            </Link>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-lg px-4">
          <div className="mb-8">
            <span className="text-8xl font-light text-gray-300">404</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Page not found</h1>
          <p className="text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="ms-button"
            >
              Go to Home
            </Link>
            <Link
              href="/security"
              className="px-6 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Security Updates
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://go.microsoft.com/fwlink/?LinkId=521839" className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="https://go.microsoft.com/fwlink/?LinkID=206977" className="hover:underline" target="_blank" rel="noopener noreferrer">Terms of Use</a>
            <a href="https://www.microsoft.com/msrc" className="hover:underline" target="_blank" rel="noopener noreferrer">MSRC</a>
          </div>
          <div>© {new Date().getFullYear()} Microsoft</div>
        </div>
      </footer>
    </div>
  );
}
