'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { HeroBanner } from '@/components/HeroBanner';
import { Navigation } from '@/components/Navigation';
import { AppFooter } from '@/components/AppFooter';

interface SecurityUpdate {
  ID: string;
  Alias: string;
  DocumentTitle: string;
  Severity: string | null;
  InitialReleaseDate: string;
  CurrentReleaseDate: string;
  CvrfUrl: string;
}

type UpdateType = 'all' | 'security' | 'mariner';

export default function SecurityUpdatesPage() {
  const [updates, setUpdates] = useState<SecurityUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<UpdateType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, [yearFilter]);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Sort by InitialReleaseDate descending by default (latest first)
      params.set('orderby', 'InitialReleaseDate');
      params.set('order', 'desc');
      params.set('top', '100');
      
      if (yearFilter) {
        params.set('yearFilter', yearFilter);
      }

      const response = await fetch(`/api/security/updates?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch security updates');
      }
      
      const data = await response.json();
      // Sort client-side as well to ensure latest first
      const sortedUpdates = (data.value || []).sort((a: SecurityUpdate, b: SecurityUpdate) => {
        return new Date(b.InitialReleaseDate).getTime() - new Date(a.InitialReleaseDate).getTime();
      });
      setUpdates(sortedUpdates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine update type
  const getUpdateType = (title: string): 'security' | 'mariner' => {
    return title.toLowerCase().includes('mariner') ? 'mariner' : 'security';
  };

  const filteredUpdates = updates.filter(update => {
    // Type filter
    if (typeFilter !== 'all') {
      const updateType = getUpdateType(update.DocumentTitle);
      if (typeFilter !== updateType) {
        return false;
      }
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        update.ID.toLowerCase().includes(query) ||
        update.DocumentTitle.toLowerCase().includes(query) ||
        update.Alias?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getTypeColor = (title: string) => {
    const type = getUpdateType(title);
    return type === 'security'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getTypeLabel = (title: string) => {
    return getUpdateType(title) === 'security' ? 'Security Update' : 'Release Notes';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <AppHeader subtitle="Security Response Center" />

      <Navigation />

      <HeroBanner
        title="Security Updates"
        description="Browse Microsoft security bulletins and vulnerability information from the MSRC CVRF API."
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1">
        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Updates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none"
                  placeholder="Search by ID, title, or CVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none bg-white"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as UpdateType)}
              >
                <option value="all">All Types</option>
                <option value="security">Security Updates</option>
                <option value="mariner">Mariner Release Notes</option>
              </select>
            </div>
          </div>
        </div>

        {/* CVE Lookup Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--ms-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Quick CVE Lookup
              </h2>
              <p className="text-sm text-gray-600">
                Search for a specific CVE to see related Microsoft security updates.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const cve = formData.get('cve') as string;
                if (cve) {
                  window.location.href = `/security/cve/${cve.toUpperCase()}`;
                }
              }}
              className="flex gap-3 flex-1 max-w-md"
            >
              <input
                name="cve"
                type="text"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--ms-blue)] focus:border-[var(--ms-blue)] outline-none"
                placeholder="e.g., CVE-2024-12345"
                pattern="CVE-\d{4}-\d{4,}"
                title="Enter a valid CVE ID (e.g., CVE-2024-12345)"
              />
              <button type="submit" className="px-6 py-2.5 bg-[var(--ms-blue)] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Look Up
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ms-blue)]"></div>
            <span className="ml-3 text-gray-600">Loading security updates...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-sm text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchUpdates}
              className="mt-4 text-sm text-[var(--ms-blue)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredUpdates.length}</span> of <span className="font-semibold">{updates.length}</span> updates
                <span className="text-gray-400 ml-2">• Sorted by latest release date</span>
              </div>
            </div>

            {/* Mobile card view */}
            <div className="block sm:hidden space-y-3">
              {filteredUpdates.map((update) => (
                <div key={update.ID} className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/security/cvrf/${update.ID}`}
                      className="text-[var(--ms-blue)] hover:underline font-semibold text-sm"
                    >
                      {update.ID}
                    </Link>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(update.DocumentTitle)}`}>
                      {getTypeLabel(update.DocumentTitle)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{update.DocumentTitle}</p>
                  {update.Alias && (
                    <p className="text-xs text-gray-500 mb-2">{update.Alias}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(update.InitialReleaseDate)}</span>
                    <Link
                      href={`/security/cvrf/${update.ID}`}
                      className="text-[var(--ms-blue)] hover:underline font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Update ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Released
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUpdates.map((update) => (
                    <tr key={update.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Link
                          href={`/security/cvrf/${update.ID}`}
                          className="text-[var(--ms-blue)] hover:underline font-semibold"
                        >
                          {update.ID}
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900 max-w-md">
                          {update.DocumentTitle}
                        </div>
                        {update.Alias && (
                          <div className="text-xs text-gray-500 mt-1.5">
                            {update.Alias}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full ${getTypeColor(update.DocumentTitle)}`}>
                          {getTypeLabel(update.DocumentTitle)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(update.InitialReleaseDate)}
                        </div>
                        {update.CurrentReleaseDate !== update.InitialReleaseDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Updated: {formatDate(update.CurrentReleaseDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <Link
                          href={`/security/cvrf/${update.ID}`}
                          className="inline-flex items-center gap-1 text-[var(--ms-blue)] hover:underline font-medium"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              </div>
              {filteredUpdates.length === 0 && (
                <div className="text-center py-16 px-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No updates found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setYearFilter('');
                    }}
                    className="mt-4 text-[var(--ms-blue)] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
