'use client';

import { IncidentType, ThreatType } from '@/types/abuse-report';
import { TIME_ZONES } from '@/lib/constants';

interface IncidentDetailsSectionProps {
  timeZone: string;
  onTimeZoneChange: (value: string) => void;
  incidentType: IncidentType | '';
  threatType: ThreatType | '';
  destinationIp: string;
  onDestinationIpChange: (value: string) => void;
  destinationIpValid: boolean | null;
  destinationPort: string;
  onDestinationPortChange: (value: string) => void;
  destinationPortValid: boolean | null;
  description: string;
  onDescriptionChange: (value: string) => void;
  fieldErrors: Record<string, boolean>;
  clearFieldError: (field: string) => void;
}

export function IncidentDetailsSection({
  timeZone, onTimeZoneChange,
  incidentType, threatType,
  destinationIp, onDestinationIpChange, destinationIpValid,
  destinationPort, onDestinationPortChange, destinationPortValid,
  description, onDescriptionChange,
  fieldErrors, clearFieldError,
}: IncidentDetailsSectionProps) {
  const showDestinationFields =
    (incidentType === 'Brute Force' || incidentType === 'Denial of Service') &&
    threatType === 'IP Address';

  return (
    <section className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
      <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Incident Details</h2>
      <div className="space-y-4">
        <div>
          <label className="ms-label">Time Zone</label>
          <select
            className="ms-input w-full sm:max-w-[200px]"
            value={timeZone}
            onChange={(e) => onTimeZoneChange(e.target.value)}
          >
            {TIME_ZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {showDestinationFields && (
          <div className="bg-blue-50 border-l-4 border-[var(--ms-blue)] rounded-sm p-4 space-y-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-[var(--ms-blue)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-800 font-semibold">
                Target Information <span className="font-normal text-gray-600">(applies to all bulk source IPs)</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="ms-label">Destination IP Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`ms-input ${
                    destinationIpValid === false ? 'border-red-500 bg-red-50' :
                    destinationIpValid === true ? 'border-green-500 bg-green-50' : ''
                  }`}
                  value={destinationIp}
                  onChange={(e) => onDestinationIpChange(e.target.value)}
                  placeholder="e.g. 203.0.113.10"
                />
                {destinationIpValid === false && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Invalid IP address format</span>
                  </div>
                )}
                {destinationIpValid === true && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Valid IP address</span>
                  </div>
                )}
                {!destinationIp && (
                  <p className="text-xs text-gray-600 mt-1">The target IP being attacked by all sources</p>
                )}
              </div>
              <div>
                <label className="ms-label">Destination Port <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`ms-input ${
                    destinationPortValid === false ? 'border-red-500 bg-red-50' :
                    destinationPortValid === true ? 'border-green-500 bg-green-50' : ''
                  }`}
                  value={destinationPort}
                  onChange={(e) => onDestinationPortChange(e.target.value)}
                  placeholder="e.g. 80, 443, 22"
                />
                {destinationPortValid === false && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Port must be 1-65535</span>
                  </div>
                )}
                {destinationPortValid === true && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Valid port number</span>
                  </div>
                )}
                {!destinationPort && (
                  <p className="text-xs text-gray-600 mt-1">The target port being attacked (1-65535)</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="ms-label">Description & Proof</label>
          <p className="text-xs text-gray-500 mb-2">Provide context, logs, or evidence to support your report.</p>
          <textarea
            className={`ms-input min-h-[120px] ${fieldErrors.description ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            value={description}
            onChange={(e) => {
              onDescriptionChange(e.target.value);
              clearFieldError('description');
            }}
            placeholder="Observed traffic analysis indicates phishing behavior..."
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-600 mt-1">Please provide a description</p>
          )}
        </div>
      </div>
    </section>
  );
}
