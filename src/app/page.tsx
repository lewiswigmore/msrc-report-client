'use client';

import { useState, useEffect } from 'react';
import { IncidentType, ThreatType, AbuseReport } from '@/types/abuse-report';
import { useAuth } from '@/components/AuthProvider';
import { INCIDENT_THREAT_MAP, THREAT_HINTS } from '@/lib/constants';
import { validateIpAddress, validatePort, validateEntry } from '@/lib/validation';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { HeroBanner } from '@/components/HeroBanner';
import { Navigation } from '@/components/Navigation';
import { LoginScreen } from '@/components/LoginScreen';
import { NotificationToast, Notification } from '@/components/NotificationToast';
import { ReporterInfoSection } from '@/components/report/ReporterInfoSection';
import { ClassificationSection } from '@/components/report/ClassificationSection';
import { IncidentDetailsSection } from '@/components/report/IncidentDetailsSection';
import { BulkTargetsSection } from '@/components/report/BulkTargetsSection';
import { SubmissionSidebar } from '@/components/report/SubmissionSidebar';

export default function Home() {
  const { isAuthenticated, userName, userEmail, acquireToken, signOut, isDemo } = useAuth();

  const [incidentType, setIncidentType] = useState<IncidentType | ''>('');
  const [threatType, setThreatType] = useState<ThreatType | ''>('');
  const [availableThreatTypes, setAvailableThreatTypes] = useState<ThreatType[]>([]);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [timeZone, setTimeZone] = useState('GMT');
  const [bulkData, setBulkData] = useState('');
  const [validationResults, setValidationResults] = useState<{valid: number; invalid: number; entries: string[]}>({valid: 0, invalid: 0, entries: []});
  const [destinationIp, setDestinationIp] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [destinationIpValid, setDestinationIpValid] = useState<boolean | null>(null);
  const [destinationPortValid, setDestinationPortValid] = useState<boolean | null>(null);
  const [isTest, setIsTest] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [delayMs, setDelayMs] = useState(1000);

  // Sync account info on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      setReporterEmail(userEmail);
      setReporterName(userName);
    }
  }, [isAuthenticated, userEmail, userName]);

  // Update available threat types when incident type changes
  useEffect(() => {
    if (incidentType) {
      const allowedTypes = INCIDENT_THREAT_MAP[incidentType] || [];
      setAvailableThreatTypes(allowedTypes);
      if (threatType && !allowedTypes.includes(threatType)) {
        setThreatType('');
      }
    } else {
      setAvailableThreatTypes([]);
      setThreatType('');
    }
  }, [incidentType, threatType]);

  // Validate bulk data when it changes or threat type changes
  useEffect(() => {
    if (!threatType || !bulkData.trim()) {
      setValidationResults({valid: 0, invalid: 0, entries: []});
      return;
    }
    const entries = bulkData.split('\n').map(l => l.trim()).filter(l => l);
    let validCount = 0;
    let invalidCount = 0;
    entries.forEach(entry => {
      if (validateEntry(entry, threatType)) validCount++;
      else invalidCount++;
    });
    setValidationResults({valid: validCount, invalid: invalidCount, entries});
  }, [bulkData, threatType]);

  // Validate destination IP/port when they change
  useEffect(() => {
    if (!destinationIp.trim()) setDestinationIpValid(null);
    else setDestinationIpValid(validateIpAddress(destinationIp));
  }, [destinationIp]);

  useEffect(() => {
    if (!destinationPort.trim()) setDestinationPortValid(null);
    else setDestinationPortValid(validatePort(destinationPort));
  }, [destinationPort]);

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: false }));
  };

  const showNotification = (type: Notification['type'], message: string, duration = 5000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleSubmit = async () => {
    // Build error map for required fields
    const errors: Record<string, boolean> = {};
    if (!incidentType) errors.incidentType = true;
    if (!threatType) errors.threatType = true;
    if (!description) errors.description = true;
    if (!bulkData.trim()) errors.bulkData = true;

    if ((incidentType === 'Brute Force' || incidentType === 'Denial of Service') && threatType === 'IP Address') {
      if (!destinationIp) errors.destinationIp = true;
      if (!destinationPort) errors.destinationPort = true;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const labels: Record<string, string> = {
        incidentType: 'Incident Type', threatType: 'Threat Type',
        description: 'Description & Proof', bulkData: 'Bulk Targets',
        destinationIp: 'Destination IP', destinationPort: 'Destination Port',
      };
      const missing = Object.keys(errors).map(k => labels[k] || k);
      showNotification('error', `Missing required fields: ${missing.join(', ')}`, 8000);
      return;
    }

    setIsSubmitting(true);
    setLogs([]);
    const lines = bulkData.split('\n').map(l => l.trim()).filter(l => l);
    const total = lines.length;
    let completed = 0;

    // Acquire access token
    let accessToken: string;
    try {
      accessToken = await acquireToken();
    } catch {
      showNotification('error', 'Failed to acquire authentication token');
      setIsSubmitting(false);
      return;
    }

    for (const item of lines) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toISOString().split('T')[1].split('.')[0];

      const report: AbuseReport = {
        date: dateStr,
        time: timeStr,
        timeZone,
        incidentType: incidentType as IncidentType,
        threatType: threatType as ThreatType,
        reporterEmail,
        reporterName,
        reportNotes: description,
        testSubmission: isTest,
        anonymizeReport: isAnonymous,
      };

      // Add destination fields for Brute Force and DoS
      if ((incidentType === 'Brute Force' || incidentType === 'Denial of Service') && threatType === 'IP Address') {
        report.destinationIp = destinationIp;
        report.destinationPort = destinationPort;
      }

      // Map threat type to the correct report field
      if (threatType === 'URL') {
        report.sourceUrl = item;
      } else if (threatType === 'IP Address') {
        report.sourceIp = item;
      } else if (threatType === 'Azure Subscription') {
        report.reportedSubscriptionId = item;
      } else if (threatType === 'Community Gallery') {
        report.publicGalleryName = item;
      } else if (threatType === 'Impersonation') {
        if (incidentType === 'Impersonation Email Name') report.impersonationEmailName = item;
        else if (incidentType === 'Impersonation Domain Url') report.impersonationDomainUrl = item;
        else if (incidentType === 'Impersonation Typo Squatting') report.impersonationTypoSquatting = item;
      } else if (threatType === 'M365 Investigation' || threatType === 'W365 Investigation' || threatType === 'Gaming') {
        report.msa = item;
      } else {
        report.reportNotes += `\nSuspected Target: ${item}`;
      }

      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(report),
        });
        const result = await response.json();
        if (response.ok) {
          setLogs(prev => [...prev, `[SUCCESS] Submitted: ${item}`]);
        } else {
          setLogs(prev => [...prev, `[ERROR] Failed ${item}: ${JSON.stringify(result)}`]);
        }
      } catch (e: any) {
        setLogs(prev => [...prev, `[ERROR] Network/Client Error ${item}: ${e.message}`]);
      }

      completed++;
      setProgress(Math.round((completed / total) * 100));

      if (completed < total) {
        setLogs(prev => [...prev, `[INFO] Waiting ${delayMs}ms before next submission... (${completed}/${total})`]);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    setLogs(prev => [...prev, `[COMPLETE] Finished processing ${total} items.`]);
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const currentHint = THREAT_HINTS[threatType as string] || THREAT_HINTS['default'];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <AppHeader
        subtitle="MSRC Abuse Reporting"
        userName={userName}
        onSignOut={signOut}
      />

      <Navigation />

      <HeroBanner
        title="Report Abuse"
        description="Submit reports for IPs, URLs, or Azure resources involved in malicious activity. Use this tool to bulk report incidents efficiently."
      />

      <main className="flex-1 px-4 pb-8 sm:pb-12 w-full max-w-5xl mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <ReporterInfoSection
              reporterName={reporterName}
              reporterEmail={reporterEmail}
              isAnonymous={isAnonymous}
              onAnonymousChange={setIsAnonymous}
            />

            <ClassificationSection
              incidentType={incidentType}
              threatType={threatType}
              availableThreatTypes={availableThreatTypes}
              fieldErrors={fieldErrors}
              onIncidentTypeChange={setIncidentType}
              onThreatTypeChange={setThreatType}
              clearFieldError={clearFieldError}
            />

            <IncidentDetailsSection
              timeZone={timeZone}
              onTimeZoneChange={setTimeZone}
              incidentType={incidentType}
              threatType={threatType}
              destinationIp={destinationIp}
              onDestinationIpChange={setDestinationIp}
              destinationIpValid={destinationIpValid}
              destinationPort={destinationPort}
              onDestinationPortChange={setDestinationPort}
              destinationPortValid={destinationPortValid}
              description={description}
              onDescriptionChange={setDescription}
              fieldErrors={fieldErrors}
              clearFieldError={clearFieldError}
            />

            <BulkTargetsSection
              threatType={threatType}
              currentHint={currentHint}
              bulkData={bulkData}
              onBulkDataChange={setBulkData}
              validationResults={validationResults}
              fieldErrors={fieldErrors}
              clearFieldError={clearFieldError}
              isTest={isTest}
              onTestChange={setIsTest}
              delayMs={delayMs}
              onDelayChange={setDelayMs}
              isSubmitting={isSubmitting}
              progress={progress}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <SubmissionSidebar logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        </div>
      </main>

      <AppFooter />

      {notification && (
        <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />
      )}
    </div>
  );
}
