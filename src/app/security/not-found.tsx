import Link from 'next/link';

export default function SecurityNotFound() {
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
              className="px-4 py-3 text-sm font-medium text-[var(--ms-blue)] border-b-2 border-[var(--ms-blue)]"
            >
              Security Updates
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/security" className="hover:text-[var(--ms-blue)]">
              Security Updates
            </Link>
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 font-medium">Not Found</span>
          </nav>
        </div>
      </div>

      {/* 404 Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white p-12 shadow-sm border border-gray-200 rounded-sm text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Security Resource Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The security update, CVE, or CVRF document you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/security"
              className="ms-button"
            >
              Browse Security Updates
            </Link>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/security" className="text-[var(--ms-blue)] hover:underline">
                View All Updates
              </Link>
              <span className="text-gray-300">|</span>
              <a href="https://msrc.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-[var(--ms-blue)] hover:underline">
                MSRC Portal
              </a>
              <span className="text-gray-300">|</span>
              <a href="https://cve.mitre.org" target="_blank" rel="noopener noreferrer" className="text-[var(--ms-blue)] hover:underline">
                CVE Database
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 mt-auto border-t border-gray-200">
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
