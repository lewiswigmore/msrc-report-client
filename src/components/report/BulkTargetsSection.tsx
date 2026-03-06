'use client';

import { ThreatType } from '@/types/abuse-report';
import { ThreatHint } from '@/lib/constants';

interface ValidationResults {
  valid: number;
  invalid: number;
  entries: string[];
}

interface BulkTargetsSectionProps {
  threatType: ThreatType | '';
  currentHint: ThreatHint;
  bulkData: string;
  onBulkDataChange: (value: string) => void;
  validationResults: ValidationResults;
  fieldErrors: Record<string, boolean>;
  clearFieldError: (field: string) => void;
  isTest: boolean;
  onTestChange: (checked: boolean) => void;
  delayMs: number;
  onDelayChange: (value: number) => void;
  isSubmitting: boolean;
  progress: number;
  onSubmit: () => void;
}

export function BulkTargetsSection({
  threatType, currentHint,
  bulkData, onBulkDataChange,
  validationResults,
  fieldErrors, clearFieldError,
  isTest, onTestChange,
  delayMs, onDelayChange,
  isSubmitting, progress, onSubmit,
}: BulkTargetsSectionProps) {
  return (
    <section className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Bulk Targets</h2>
        <span className="text-sm font-semibold text-[var(--ms-blue)]">
          {validationResults.entries.length} Items
        </span>
      </div>

      <div className="space-y-3">
        <label className="ms-label">{currentHint.label}</label>
        <textarea
          className={`ms-input font-mono text-xs min-h-[300px] ${fieldErrors.bulkData ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          value={bulkData}
          onChange={(e) => {
            onBulkDataChange(e.target.value);
            clearFieldError('bulkData');
          }}
          placeholder={threatType ? currentHint.placeholder : 'Select incident type and threat type first'}
          disabled={!threatType}
        />
        {fieldErrors.bulkData && (
          <p className="text-xs text-red-600 mt-1">Please add at least one target</p>
        )}

        {/* Validation Stats */}
        {threatType && bulkData.trim() && (
          <div className="border border-gray-200 bg-gray-50 p-3 rounded-sm">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  <span className="font-semibold">{validationResults.valid}</span> valid
                </span>
              </div>
              {validationResults.invalid > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    <span className="font-semibold">{validationResults.invalid}</span> invalid
                  </span>
                </div>
              )}
              <div className="text-gray-500 ml-auto font-medium">
                {validationResults.entries.length} total
              </div>
            </div>
          </div>
        )}

        {/* Validation Helper Text */}
        {threatType && (
          <div className="text-xs text-gray-600 bg-blue-50 border-l-4 border-[var(--ms-blue)] p-3 rounded-sm">
            <span className="font-semibold text-[var(--ms-blue)]">Expected format:</span>{' '}
            {threatType === 'IP Address' && 'IPv4 (192.168.1.1) or IPv6'}
            {threatType === 'URL' && 'http:// or https:// URLs only'}
            {threatType === 'Azure Subscription' && 'UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)'}
            {threatType === 'Community Gallery' && 'Public gallery name'}
            {threatType === 'Impersonation' && 'Email name, domain URL, or typosquatting domain'}
            {threatType === 'M365 Investigation' && 'M365 account email or MSA'}
            {threatType === 'W365 Investigation' && 'W365 account email or MSA'}
            {threatType === 'Gaming' && 'MSA, gamertag, or developer info'}
          </div>
        )}

        {validationResults.invalid > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-amber-900">Validation Warning</p>
                <p className="text-amber-800 mt-1">
                  {validationResults.invalid} {validationResults.invalid === 1 ? 'entry does' : 'entries do'} not match the expected format and will be skipped.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <input
              id="test-submission"
              type="checkbox"
              className="ms-checkbox shrink-0"
              checked={isTest}
              onChange={(e) => onTestChange(e.target.checked)}
            />
            <label htmlFor="test-submission" className="ml-2 block text-sm text-[var(--foreground)]">
              Test Submission Mode <span className="text-gray-500 hidden sm:inline">(No ticket created)</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--foreground)] whitespace-nowrap">Delay (ms):</label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={delayMs}
              onChange={(e) => onDelayChange(Number(e.target.value))}
              className="ms-input w-20 py-1"
            />
            <span className="text-xs text-gray-500">per request</span>
          </div>
        </div>

        <div className="flex items-stretch sm:items-center justify-end">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`ms-button w-full sm:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Submit Report'}
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="mt-6 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[var(--ms-blue)] h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  );
}
