'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface CVEUpdate {
  ID: string;
  Alias: string;
  DocumentTitle: string;
  Severity: string | null;
  InitialReleaseDate: string;
  CurrentReleaseDate: string;
  CvrfUrl: string;
}

interface CVEResponse {
  cve: string;
  updates: CVEUpdate[];
  totalUpdates: number;
}

export default function CVEDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CVEResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCVE();
  }, [id]);

  const fetchCVE = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/security/cve/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No Microsoft security updates found for ${id.toUpperCase()}`);
        }
        if (response.status === 400) {
          throw new Error('Invalid CVE ID format. Please use format: CVE-YYYY-NNNNN');
        }
        throw new Error('Failed to fetch CVE data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            <span className="text-gray-900 font-medium">{id.toUpperCase()}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ms-blue)]"></div>
            <span className="ml-3 text-gray-600">Searching for {id.toUpperCase()}...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-sm text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-800 text-lg font-medium mb-2">{error}</p>
            <p className="text-red-600 text-sm mb-6">
              This CVE may not be related to Microsoft products, or updates have not been published yet.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/security"
                className="text-sm text-[var(--ms-blue)] hover:underline"
              >
                ← Back to Security Updates
              </Link>
              <a
                href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id.toUpperCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--ms-blue)] hover:underline"
              >
                View on MITRE →
              </a>
            </div>
          </div>
        ) : data ? (
          <>
            {/* CVE Header */}
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">{data.cve}</h1>
                <a
                  href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${data.cve}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--ms-blue)] hover:underline flex items-center gap-1"
                >
                  View on MITRE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${data.cve}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--ms-blue)] hover:underline flex items-center gap-1"
                >
                  View on NVD
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <p className="text-gray-600">
                Found in <strong>{data.totalUpdates}</strong> Microsoft Security Update{data.totalUpdates !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Related Updates */}
            <h2 className="text-lg font-semibold mb-4">Related Security Updates</h2>
            <div className="space-y-4">
              {data.updates.map((update) => (
                <div
                  key={update.ID}
                  className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm hover:border-[var(--ms-blue)] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/security/cvrf/${update.ID}`}
                          className="text-lg font-semibold text-[var(--ms-blue)] hover:underline"
                        >
                          {update.ID}
                        </Link>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${getSeverityColor(update.Severity)}`}>
                          {update.Severity || 'N/A'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{update.DocumentTitle}</p>
                      {update.Alias && (
                        <p className="text-sm text-gray-500">{update.Alias}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Released: {formatDate(update.InitialReleaseDate)}</div>
                      {update.CurrentReleaseDate !== update.InitialReleaseDate && (
                        <div>Updated: {formatDate(update.CurrentReleaseDate)}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                    <Link
                      href={`/security/cvrf/${update.ID}`}
                      className="text-sm text-[var(--ms-blue)] hover:underline"
                    >
                      View Full Details →
                    </Link>
                    {update.CvrfUrl && (
                      <a
                        href={update.CvrfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:underline"
                      >
                        CVRF Document (External)
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data.updates.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 p-8 rounded-sm text-center">
                <p className="text-gray-600">No security updates found for this CVE.</p>
              </div>
            )}
          </>
        ) : null}
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
