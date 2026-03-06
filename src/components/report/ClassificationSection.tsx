'use client';

import { IncidentType, ThreatType } from '@/types/abuse-report';
import { INCIDENT_TYPES } from '@/lib/constants';

interface ClassificationSectionProps {
  incidentType: IncidentType | '';
  threatType: ThreatType | '';
  availableThreatTypes: ThreatType[];
  fieldErrors: Record<string, boolean>;
  onIncidentTypeChange: (value: IncidentType | '') => void;
  onThreatTypeChange: (value: ThreatType | '') => void;
  clearFieldError: (field: string) => void;
}

export function ClassificationSection({
  incidentType, threatType, availableThreatTypes,
  fieldErrors, onIncidentTypeChange, onThreatTypeChange, clearFieldError,
}: ClassificationSectionProps) {
  return (
    <section className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
      <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Classification</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="ms-label">Incident Type</label>
          <select
            className={`ms-input ${fieldErrors.incidentType ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            value={incidentType}
            onChange={(e) => {
              onIncidentTypeChange(e.target.value as IncidentType);
              clearFieldError('incidentType');
            }}
          >
            <option value="">Select Incident Type...</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {fieldErrors.incidentType && (
            <p className="text-xs text-red-600 mt-1">Please select an incident type</p>
          )}
        </div>
        <div>
          <label className="ms-label">Threat Type</label>
          <select
            className={`ms-input ${fieldErrors.threatType ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            value={threatType}
            onChange={(e) => {
              onThreatTypeChange(e.target.value as ThreatType);
              clearFieldError('threatType');
            }}
            disabled={!incidentType}
          >
            <option value="">{incidentType ? 'Select threat type' : 'Select incident type first'}</option>
            {availableThreatTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {incidentType && (
            <p className="text-xs text-gray-500 mt-1">Available types for {incidentType}</p>
          )}
          {fieldErrors.threatType && (
            <p className="text-xs text-red-600 mt-1">Please select a threat type</p>
          )}
        </div>
      </div>
    </section>
  );
}
