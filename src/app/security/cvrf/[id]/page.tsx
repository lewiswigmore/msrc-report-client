'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

// Helper to safely extract string value from various API formats
const extractValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'Value' in (val as Record<string, unknown>)) {
    return extractValue((val as Record<string, unknown>).Value);
  }
  return String(val);
};

interface CVRFDocument {
  DocumentTitle?: { Value: string } | string;
  DocumentType?: { Value: string } | string;
  DocumentPublisher?: {
    Type: string;
    ContactDetails?: { Value: string };
    IssuingAuthority?: { Value: string };
  };
  DocumentTracking?: {
    Identification?: { ID?: { Value: string }; Alias?: { Value: string } };
    Status?: string;
    Version?: string;
    RevisionHistory?: Array<{
      Number: string;
      Date: string;
      Description?: { Value: string } | string;
    }>;
    InitialReleaseDate?: string;
    CurrentReleaseDate?: string;
  };
  DocumentNotes?: Array<{
    Type: string | number;
    Ordinal: string;
    Title?: string;
    Value?: string | { Value: string };
  }>;
  Vulnerability?: Array<{
    CVE?: string;
    Title?: { Value: string } | string;
    Notes?: Array<{ Type: string | number; Ordinal: string; Title?: string; Value?: string | { Value: string } }>;
    Threats?: Array<{
      Type: string | number;
      Description?: { Value: string } | string;
      ProductID?: string[];
    }>;
    CVSSScoreSets?: Array<{
      BaseScore: number;
      TemporalScore?: number;
      Vector?: string;
    }>;
    Remediations?: Array<{
      Type: string | number;
      Description?: { Value: string } | string;
      URL?: string;
      ProductID?: string[];
      Supercedence?: string;
    }>;
  }>;
  ProductTree?: {
    Branch?: Array<{
      Type: string;
      Name: string;
      Items?: Array<{ ProductID: string; Value: string }>;
    }>;
    FullProductName?: Array<{ ProductID: string; Value: string }>;
  };
}

// Stat card component for overview
const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-50 rounded-lg text-[var(--ms-blue)]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function CVRFDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [document, setDocument] = useState<CVRFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'products'>('overview');
  const [productSearch, setProductSearch] = useState('');
  const [vulnSearch, setVulnSearch] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/security/cvrf/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`CVRF document "${id}" not found`);
        }
        throw new Error('Failed to fetch CVRF document');
      }

      const data = await response.json();
      setDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9) return 'bg-red-600 text-white';
    if (score >= 7) return 'bg-orange-500 text-white';
    if (score >= 4) return 'bg-yellow-500 text-gray-900';
    return 'bg-green-500 text-white';
  };

  const getCVSSSeverity = (score: number) => {
    if (score >= 9) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  // Filter products based on search
  const filteredProducts = document?.ProductTree?.FullProductName?.filter(product => {
    if (!productSearch) return true;
    const searchLower = productSearch.toLowerCase();
    return product.Value.toLowerCase().includes(searchLower) || 
           product.ProductID.toLowerCase().includes(searchLower);
  }) || [];

  // Filter vulnerabilities based on search
  const filteredVulnerabilities = document?.Vulnerability?.filter(vuln => {
    if (!vulnSearch) return true;
    const searchLower = vulnSearch.toLowerCase();
    return vuln.CVE?.toLowerCase().includes(searchLower) ||
           extractValue(vuln.Title).toLowerCase().includes(searchLower);
  }) || [];

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
            <span className="text-gray-900 font-medium">{id}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ms-blue)]"></div>
            <span className="ml-3 text-gray-600">Loading CVRF document...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-sm text-center">
            <p className="text-red-800">{error}</p>
            <Link
              href="/security"
              className="mt-4 inline-block text-sm text-[var(--ms-blue)] hover:underline"
            >
              ← Back to Security Updates
            </Link>
          </div>
        ) : document ? (
          <>
            {/* Document Header */}
            <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {extractValue(document.DocumentType) || 'Security Update'}
                    </span>
                    <span className="text-sm text-gray-500">
                      v{document.DocumentTracking?.Version || '1.0'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                    {extractValue(document.DocumentTitle) || id}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Released: <strong>{formatDate(document.DocumentTracking?.InitialReleaseDate)}</strong></span>
                    </div>
                    {document.DocumentTracking?.CurrentReleaseDate !== document.DocumentTracking?.InitialReleaseDate && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Updated: <strong>{formatDate(document.DocumentTracking?.CurrentReleaseDate)}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                label="Vulnerabilities"
                value={document.Vulnerability?.length || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
              />
              <StatCard
                label="Products"
                value={document.ProductTree?.FullProductName?.length || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                }
              />
              <StatCard
                label="Revisions"
                value={document.DocumentTracking?.RevisionHistory?.length || 1}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex gap-1">
                {(['overview', 'vulnerabilities', 'products'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
                      activeTab === tab
                        ? 'border-[var(--ms-blue)] text-[var(--ms-blue)] bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'vulnerabilities' && document.Vulnerability && (
                      <span className="ml-2 bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {document.Vulnerability.length}
                      </span>
                    )}
                    {tab === 'products' && document.ProductTree?.FullProductName && (
                      <span className="ml-2 bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {document.ProductTree.FullProductName.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Document Notes */}
                {document.DocumentNotes && document.DocumentNotes.length > 0 && (
                  <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--ms-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Document Notes
                    </h2>
                    <div className="space-y-6">
                      {document.DocumentNotes.map((note, idx) => (
                        <div key={idx} className="border-l-4 border-[var(--ms-blue)] pl-6 py-2 bg-gray-50 rounded-r-lg">
                          {note.Title && (
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">{note.Title}</h3>
                          )}
                          <div 
                            className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: extractValue(note.Value) }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revision History */}
                {document.DocumentTracking?.RevisionHistory && document.DocumentTracking.RevisionHistory.length > 0 && (
                  <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--ms-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Revision History
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Version</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {document.DocumentTracking.RevisionHistory.map((rev, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  v{rev.Number}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(rev.Date)}</td>
                              <td 
                                className="px-6 py-4 text-sm text-gray-700"
                                dangerouslySetInnerHTML={{ __html: extractValue(rev.Description) || '-' }}
                              />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <div className="space-y-6">
                {/* Search bar for vulnerabilities */}
                <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search vulnerabilities by CVE ID or title..."
                        value={vulnSearch}
                        onChange={(e) => setVulnSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none"
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredVulnerabilities.length} of {document.Vulnerability?.length || 0} vulnerabilities
                    </div>
                  </div>
                </div>

                {filteredVulnerabilities.length > 0 ? (
                  filteredVulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {vuln.CVE ? (
                              <Link
                                href={`/security/cve/${vuln.CVE}`}
                                className="text-xl font-bold text-[var(--ms-blue)] hover:underline"
                              >
                                {vuln.CVE}
                              </Link>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">Vulnerability {idx + 1}</span>
                            )}
                            {vuln.CVSSScoreSets && vuln.CVSSScoreSets[0] && (
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCVSSColor(vuln.CVSSScoreSets[0].BaseScore)}`}>
                                {getCVSSSeverity(vuln.CVSSScoreSets[0].BaseScore)}
                              </span>
                            )}
                          </div>
                          {vuln.Title && (
                            <p className="text-gray-700 text-lg">{extractValue(vuln.Title)}</p>
                          )}
                        </div>
                        {vuln.CVSSScoreSets && vuln.CVSSScoreSets[0] && (
                          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 min-w-[120px]">
                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">CVSS Score</span>
                            <span className={`text-3xl font-bold mt-1 ${
                              vuln.CVSSScoreSets[0].BaseScore >= 9 ? 'text-red-600' :
                              vuln.CVSSScoreSets[0].BaseScore >= 7 ? 'text-orange-500' :
                              vuln.CVSSScoreSets[0].BaseScore >= 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {vuln.CVSSScoreSets[0].BaseScore.toFixed(1)}
                            </span>
                            {vuln.CVSSScoreSets[0].Vector && (
                              <span className="text-xs text-gray-400 mt-2 break-all max-w-[200px] text-center">
                                {vuln.CVSSScoreSets[0].Vector}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Vulnerability Notes */}
                      {vuln.Notes && vuln.Notes.length > 0 && (
                        <div className="mb-6 space-y-4">
                          {vuln.Notes.filter(note => extractValue(note.Value)).map((note, noteIdx) => (
                            <div key={noteIdx} className="bg-gray-50 rounded-lg p-5">
                              <span className="font-semibold text-gray-900 block mb-2">
                                {note.Title || `Type ${note.Type}`}:
                              </span>
                              <div 
                                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: extractValue(note.Value) }} 
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Remediations */}
                      {vuln.Remediations && vuln.Remediations.length > 0 && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Remediations
                          </h4>
                          <div className="grid gap-3">
                            {vuln.Remediations.slice(0, 5).map((rem, remIdx) => (
                              <div key={remIdx} className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
                                <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Type {rem.Type}
                                </span>
                                {extractValue(rem.Description) && (
                                  <span className="text-gray-700 flex-1">{extractValue(rem.Description)}</span>
                                )}
                                {rem.URL && (
                                  <a
                                    href={rem.URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[var(--ms-blue)] hover:underline font-medium whitespace-nowrap"
                                  >
                                    Download
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            ))}
                            {vuln.Remediations.length > 5 && (
                              <p className="text-sm text-gray-500 text-center py-2">
                                +{vuln.Remediations.length - 5} more remediations
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {vulnSearch ? 'No vulnerabilities match your search.' : 'No vulnerabilities listed in this document.'}
                    </p>
                    {vulnSearch && (
                      <button
                        onClick={() => setVulnSearch('')}
                        className="mt-4 text-[var(--ms-blue)] hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--ms-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Affected Products
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 lg:w-80">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none"
                      />
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {filteredProducts.length} of {document.ProductTree?.FullProductName?.length || 0} products
                    </span>
                  </div>
                </div>
                
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredProducts.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-500 min-w-[80px]">
                          {product.ProductID}
                        </span>
                        <span className="text-gray-800 leading-relaxed">{product.Value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {productSearch ? 'No products match your search.' : 'No product information available.'}
                    </p>
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch('')}
                        className="mt-4 text-[var(--ms-blue)] hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
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
