'use client';

import { useState, useEffect } from 'react';
import { IncidentType, ThreatType, AbuseReport } from '@/types/abuse-report';
import Image from 'next/image';
import Link from 'next/link';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/authConfig';

const INCIDENT_TYPES: IncidentType[] = [
  'Brute Force',
  'Denial of Service',
  'Malware',
  'Illegal/Violates the rights of others',
  'Phishing',
  'Spam',
];

const THREAT_TYPES: ThreatType[] = [
  'IP Address',
  'URL',
  'Azure Subscription',
];

// Map incident types to their allowed threat types (per official API docs)
const INCIDENT_THREAT_MAP: Record<string, ThreatType[]> = {
  'Brute Force': ['IP Address'],
  'Denial of Service': ['IP Address'],
  'Malware': ['IP Address', 'URL'],
  'Phishing': ['URL'],
  'Spam': ['IP Address'],
  'Illegal/Violates the rights of others': ['IP Address', 'URL'],
};

const TIME_ZONES = [
  'GMT', 'UTC', 'PST', 'PDT', 'EST', 'EDT', 'CST', 'CDT', 'MST', 'MDT', 'IST', 'CET', 'JST'
];

interface ThreatHint {
  label: string;
  placeholder: string;
}

const THREAT_HINTS: Record<string, ThreatHint> = {
  'default': { 
    label: 'Target List (One per line)', 
    placeholder: 'Paste IPs, URLs, or Subscription IDs based on threat type.' 
  },
  'IP Address': { 
    label: 'IP Addresses (One per line)', 
    placeholder: '192.168.1.5\n10.0.0.1\n203.0.113.42' 
  },
  'URL': { 
    label: 'URLs (One per line)', 
    placeholder: 'https://malicious-site.com/login\nhttp://phishing.example.com\nhttps://fake-portal.net' 
  },
  'Azure Subscription': { 
    label: 'Azure Subscription IDs (One per line)', 
    placeholder: '00000000-0000-0000-0000-000000000000\n11111111-1111-1111-1111-111111111111' 
  },
};

export default function Home() {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const [incidentType, setIncidentType] = useState<IncidentType | ''>('');
  const [threatType, setThreatType] = useState<ThreatType | ''>('');
  const [availableThreatTypes, setAvailableThreatTypes] = useState<ThreatType[]>([]);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [timeZone, setTimeZone] = useState('GMT');
  const [bulkData, setBulkData] = useState('');
  const [validationResults, setValidationResults] = useState<{valid: number, invalid: number, entries: string[]}>({valid: 0, invalid: 0, entries: []});
  const [destinationIp, setDestinationIp] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [destinationIpValid, setDestinationIpValid] = useState<boolean | null>(null);
  const [destinationPortValid, setDestinationPortValid] = useState<boolean | null>(null);
  const [isTest, setIsTest] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState<{type: 'error' | 'success' | 'warning' | 'info', message: string} | null>(null);
  const [delayMs, setDelayMs] = useState(1000); // Default 1 second delay between submissions

  useEffect(() => {
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      const account = accounts[0];
      setUserEmail(account.username || '');
      setUserName(account.name || '');
      setReporterEmail(account.username || '');
      setReporterName(account.name || '');
    } else {
      setIsAuthenticated(false);
    }
  }, [accounts]);

  // Update available threat types when incident type changes
  useEffect(() => {
    if (incidentType) {
      const allowedTypes = INCIDENT_THREAT_MAP[incidentType] || [];
      setAvailableThreatTypes(allowedTypes);
      // Reset threat type if current selection is not allowed
      if (threatType && !allowedTypes.includes(threatType)) {
        setThreatType('');
      }
    } else {
      setAvailableThreatTypes([]);
      setThreatType('');
    }
  }, [incidentType, threatType]);

  // Validation functions
  const validateIpAddress = (ip: string): boolean => {
    // IPv4
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateAzureSubscription = (id: string): boolean => {
    // UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
  };

  const validatePort = (port: string): boolean => {
    const portNum = parseInt(port, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const validateEntry = (entry: string, type: ThreatType): boolean => {
    if (!entry.trim()) return false;
    switch (type) {
      case 'IP Address':
        return validateIpAddress(entry);
      case 'URL':
        return validateUrl(entry);
      case 'Azure Subscription':
        return validateAzureSubscription(entry);
      default:
        return false;
    }
  };

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
      if (validateEntry(entry, threatType)) {
        validCount++;
      } else {
        invalidCount++;
      }
    });

    setValidationResults({valid: validCount, invalid: invalidCount, entries});
  }, [bulkData, threatType]);

  // Validate destination IP when it changes
  useEffect(() => {
    if (!destinationIp.trim()) {
      setDestinationIpValid(null);
    } else {
      setDestinationIpValid(validateIpAddress(destinationIp));
    }
  }, [destinationIp]);

  // Validate destination port when it changes
  useEffect(() => {
    if (!destinationPort.trim()) {
      setDestinationPortValid(null);
    } else {
      setDestinationPortValid(validatePort(destinationPort));
    }
  }, [destinationPort]);

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (e: any) {
      setNotification({type: 'error', message: `Login failed: ${e.message}`});
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleSubmit = async () => {
    if (!incidentType || !threatType || !reporterName || !reporterEmail || !description || !bulkData) {
      setNotification({type: 'error', message: 'Please fill in all required fields'});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Validate required fields for specific incident types
    if ((incidentType === 'Brute Force' || incidentType === 'Denial of Service') && threatType === 'IP Address') {
      if (!destinationIp || !destinationPort) {
        setNotification({type: 'error', message: `Destination IP and Port are required for ${incidentType} incidents`});
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    setIsSubmitting(true);
    setLogs([]);
    const lines = bulkData.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    const total = lines.length;
    let completed = 0;

    for (const item of lines) {
      const now = new Date();
      // Format date as YYYY-MM-DD
      const dateStr = now.toISOString().split('T')[0];
      // Format time as HH:mm:ss
      const timeStr = now.toISOString().split('T')[1].split('.')[0];

      const report: AbuseReport = {
        date: dateStr,
        time: timeStr,
        timeZone: timeZone,
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

      // Map threat type to specific field for the bulk item
      if (threatType === 'URL') {
        report.sourceUrl = item;
      } else if (threatType === 'IP Address') {
        report.sourceIp = item;
      } else if (threatType === 'Azure Subscription') {
        report.reportedSubscriptionId = item;
      } else {
        report.reportNotes += `\nSuspected Target: ${item}`;
      }


      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });

        const result = await response.json();
        if (response.ok) {
          setLogs((prev: string[]) => [...prev, `[SUCCESS] Submitted: ${item}`]);
        } else {
          setLogs((prev: string[]) => [...prev, `[ERROR] Failed ${item}: ${JSON.stringify(result)}`]);
        }
      } catch (e: any) {
        setLogs((prev: string[]) => [...prev, `[ERROR] Network/Client Error ${item}: ${e.message}`]);
      }

      completed++;
      setProgress(Math.round((completed / total) * 100));

      // Rate limiting: Add delay between submissions to prevent API abuse
      if (completed < total) {
        setLogs((prev: string[]) => [...prev, `[INFO] Waiting ${delayMs}ms before next submission... (${completed}/${total})`]);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    setLogs((prev: string[]) => [...prev, `[COMPLETE] Finished processing ${total} items. Success: ${logs.filter(l => l.includes('[SUCCESS]')).length}`]);
    setIsSubmitting(false);
  };

  const currentHint = THREAT_HINTS[threatType as string] || THREAT_HINTS['default'];

  // Full-page login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] flex flex-col">
        {/* Microsoft Header */}
        <header className="bg-[var(--ms-header-bg)] text-white h-[48px] flex items-center px-6 shrink-0">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 23 23" className="w-[23px] h-[23px]" aria-label="Microsoft Logo">
              <rect x="0" y="0" width="10" height="10" fill="#f25022"></rect>
              <rect x="12" y="0" width="10" height="10" fill="#7fba00"></rect>
              <rect x="0" y="12" width="10" height="10" fill="#00a4ef"></rect>
              <rect x="12" y="12" width="10" height="10" fill="#ffb900"></rect>
            </svg>
            <span className="font-semibold text-[15px]">Microsoft</span>
          </div>
        </header>

        {/* Login Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-lg px-11 py-11">
              {/* Microsoft Logo */}
              <div className="flex justify-center mb-6">
                <svg viewBox="0 0 23 23" className="w-20 h-20" aria-label="Microsoft Logo">
                  <rect x="0" y="0" width="10" height="10" fill="#f25022"></rect>
                  <rect x="12" y="0" width="10" height="10" fill="#7fba00"></rect>
                  <rect x="0" y="12" width="10" height="10" fill="#00a4ef"></rect>
                  <rect x="12" y="12" width="10" height="10" fill="#ffb900"></rect>
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-semibold text-center mb-4 text-[#1f1f1f]">
                MSRC Abuse Report Portal
              </h1>
              
              {/* Description */}
              <p className="text-center text-[#605e5c] text-sm mb-8 leading-relaxed">
                Sign in with your organizational account to access the MSRC abuse reporting tool. 
                Access is restricted to authorized users within your organization.
              </p>

              {/* Error notification if any */}
              {notification && notification.type === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {notification.message}
                </div>
              )}

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                className="w-full bg-[var(--ms-blue)] hover:bg-[#106ebe] text-white py-3 px-4 font-semibold text-[15px] transition-colors duration-150"
              >
                Sign in with Microsoft
              </button>

              {/* Footer text */}
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

        {/* Footer */}
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

  // Main application (authenticated users only)
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Microsoft Header */}
      <header className="bg-[var(--ms-header-bg)] text-white min-h-[48px] flex items-center px-3 sm:px-4 md:px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <svg viewBox="0 0 23 23" className="w-[20px] h-[20px] sm:w-[23px] sm:h-[23px] block" aria-label="Microsoft Logo">
              <rect x="0" y="0" width="10" height="10" fill="#f25022"></rect>
              <rect x="12" y="0" width="10" height="10" fill="#7fba00"></rect>
              <rect x="0" y="12" width="10" height="10" fill="#00a4ef"></rect>
              <rect x="12" y="12" width="10" height="10" fill="#ffb900"></rect>
            </svg>
            <span className="font-semibold text-[13px] sm:text-[15px] leading-tight">Microsoft</span>
          </div>
          <div className="h-4 w-px bg-gray-600 mx-1 sm:mx-2 hidden sm:block"></div>
          <span className="text-[11px] sm:text-[13px] md:text-[15px] hidden sm:block truncate">MSRC Abuse Reporting</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 ml-2">
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 whitespace-nowrap hidden sm:block">{userName}</div>
          <button 
            onClick={handleLogout}
            className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#f8f8f8] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            <Link
              href="/"
              className="px-4 py-3 text-sm font-medium text-[var(--ms-blue)] border-b-2 border-[var(--ms-blue)] whitespace-nowrap"
            >
              Report Abuse
            </Link>
            <Link
              href="/security"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 whitespace-nowrap"
            >
              Security Updates
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Banner */}
      <div className="bg-[var(--ms-blue)] text-white p-6 sm:p-8 md:p-12 mb-4 sm:mb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light mb-2">Report Abuse</h1>
          <p className="text-xs sm:text-sm md:text-base opacity-90 max-w-2xl">
            Submit reports for IPs, URLs, or Azure resources involved in malicious activity. Use this tool to bulk report incidents efficiently.
          </p>
        </div>
      </div>

      (
      <main className="flex-1 px-3 sm:px-4 pb-8 sm:pb-12 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Reporter Info Section */}
            <section className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[var(--foreground)]">Reporter Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="ms-label">Full Name</label>
                  <input
                    type="text"
                    className="ms-input bg-gray-50"
                    value={reporterName}
                    readOnly
                    placeholder="Populated from Microsoft account"
                  />
                </div>
                <div>
                  <label className="ms-label">Email Address</label>
                  <input
                    type="email"
                    className="ms-input bg-gray-50"
                    value={reporterEmail}
                    readOnly
                    placeholder="Populated from Microsoft account"
                  />
                  <p className="text-xs text-gray-500 mt-1">Authenticated Microsoft account</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[var(--ms-blue)] border-gray-300 rounded focus:ring-[var(--ms-blue)]"
                  />
                  <span className="text-sm text-gray-700">Submit report anonymously</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Your identity will be hidden from the reported party, but Microsoft will retain your information for investigation purposes.
                </p>
              </div>
            </section>

             {/* Classification Section */}
             <section className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[var(--foreground)]">Classification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="ms-label">Incident Type</label>
                  <select
                    className="ms-input"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                  >
                    <option value="">Select Incident Type...</option>
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ms-label">Threat Type</label>
                  <select
                    className="ms-input"
                    value={threatType}
                    onChange={(e) => setThreatType(e.target.value as ThreatType)}
                    disabled={!incidentType}
                  >
                    <option value="">{incidentType ? 'Select threat type' : 'Select incident type first'}</option>
                    {availableThreatTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {incidentType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available types for {incidentType}
                    </p>
                  )}
                </div>
              </div>
            </section>

             {/* Details Section */}
             <section className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[var(--foreground)]">Incident Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="ms-label">Time Zone</label>
                   <select
                    className="ms-input w-full sm:max-w-[200px]"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                  >
                    {TIME_ZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional fields for Brute Force and Denial of Service */}
                {(incidentType === 'Brute Force' || incidentType === 'Denial of Service') && threatType === 'IP Address' && (
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
                          onChange={(e) => setDestinationIp(e.target.value)}
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
                          onChange={(e) => setDestinationPort(e.target.value)}
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
                    className="ms-input min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Observed traffic analysis indicates phishing behavior..."
                  />
                </div>
              </div>
            </section>

             {/* Targets Section */}
             <section className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 rounded-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
                 <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">Bulk Targets</h2>
                 <span className="text-xs sm:text-sm font-semibold text-[var(--ms-blue)]">
                    {validationResults.entries.length} Items
                 </span>
              </div>
              <div className="space-y-3">
                <label className="ms-label">{currentHint.label}</label>
                <textarea
                  className="ms-input font-mono text-xs min-h-[300px]"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder={threatType ? currentHint.placeholder : 'Select incident type and threat type first'}
                  disabled={!threatType}
                />
                
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

              <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                      <input
                      id="test-submission"
                      type="checkbox"
                      className="ms-checkbox shrink-0"
                      checked={isTest}
                      onChange={(e) => setIsTest(e.target.checked)}
                      />
                      <label htmlFor="test-submission" className="ml-2 block text-xs sm:text-sm text-[var(--foreground)]">
                      Test Submission Mode <span className="text-gray-500 hidden sm:inline">(No ticket created)</span>
                      </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm text-[var(--foreground)] whitespace-nowrap">Delay (ms):</label>
                    <input
                      type="number"
                      min="100"
                      max="5000"
                      step="100"
                      value={delayMs}
                      onChange={(e) => setDelayMs(Number(e.target.value))}
                      className="ms-input w-20 py-1"
                    />
                    <span className="text-xs text-gray-500">per request</span>
                  </div>
                </div>
                
                <div className="flex items-stretch sm:items-center justify-end">
                
                  <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`ms-button w-full sm:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      {isSubmitting ? 'Processing...' : 'Submit Report'}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                  <div className="mt-6 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[var(--ms-blue)] h-1.5 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                  </div>
              )}
            </section>

          </div>

          {/* Sidebar / Logs */}
           <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[var(--foreground)]">Submission Logs</h3>
                  {logs.length === 0 ? (
                      <div className="text-xs sm:text-sm text-gray-500 italic py-6 sm:py-8 text-center border-2 border-dashed border-gray-100 rounded">
                          Logs will appear here after submission starts.
                      </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto text-xs font-mono">
                        {logs.map((log: string, i: number) => (
                        <div key={i} className={`mb-1.5 pb-1.5 border-b border-gray-100 last:border-0 ${
                            log.includes('[ERROR]') ? 'text-red-600' : 'text-green-700'
                        }`}>
                            <span className="opacity-50 mr-2">{i + 1}.</span>
                            {log}
                        </div>
                        ))}
                    </div>
                  )}
                  {logs.length > 0 && (
                      <div className="mt-4 text-right">
                          <button 
                            onClick={() => setLogs([])}
                            className="text-xs text-[var(--ms-blue)] hover:underline"
                          >
                              Clear Logs
                          </button>
                      </div>
                  )}
              </div>

               <div className="bg-gray-50 p-4 sm:p-6 border border-gray-200 rounded-sm text-xs sm:text-sm text-gray-600">
                   <h4 className="font-semibold mb-2 text-sm sm:text-base text-[var(--foreground)]">Help & Guidance</h4>
                   <p className="mb-2">For high-severity incidents, please ensure immediate mitigation steps are taken locally.</p>
                   <ul className="list-disc pl-4 space-y-1">
                       <li>Check MSRC guidelines for evidence requirements.</li>
                       <li>Bulk limits may apply to API throughput.</li>
                       <li>Use Test Mode to validate format first.</li>
                   </ul>
               </div>
           </div>

        </div>
      </main>

      <footer className="bg-gray-100 py-6 sm:py-8 px-3 sm:px-4 mt-auto border-t border-gray-200">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs text-gray-500 gap-3 sm:gap-4">
             <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                 <a href="https://go.microsoft.com/fwlink/?LinkId=521839" className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
                 <a href="https://go.microsoft.com/fwlink/?LinkID=206977" className="hover:underline" target="_blank" rel="noopener noreferrer">Terms of Use</a>
                 <a href="https://go.microsoft.com/fwlink/?linkid=2196228" className="hover:underline" target="_blank" rel="noopener noreferrer">Trademarks</a>
             </div>
             <div className="text-center md:text-right">
                 © {new Date().getFullYear()} Microsoft
             </div>
         </div>
      </footer>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full sm:w-auto animate-slide-in`}>
          <div className={`rounded-sm shadow-lg border-l-4 p-4 flex items-start gap-3 ${
            notification.type === 'error' ? 'bg-red-50 border-red-500' :
            notification.type === 'success' ? 'bg-green-50 border-green-500' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
            'bg-blue-50 border-blue-500'
          }`}>
            <div className="shrink-0">
              {notification.type === 'error' && (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'success' && (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                notification.type === 'error' ? 'text-red-800' :
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`shrink-0 ${
                notification.type === 'error' ? 'text-red-500 hover:text-red-700' :
                notification.type === 'success' ? 'text-green-500 hover:text-green-700' :
                notification.type === 'warning' ? 'text-yellow-500 hover:text-yellow-700' :
                'text-blue-500 hover:text-blue-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
