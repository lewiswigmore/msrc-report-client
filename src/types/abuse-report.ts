export type IncidentType =
  | 'Brute Force'
  | 'Denial of Service'
  | 'Illegal/Violates the rights of others'
  | 'Malware'
  | 'Phishing'
  | 'Spam';

export type ThreatType =
  | 'IP Address'
  | 'URL'
  | 'Azure Subscription';

export interface AbuseReport {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timeZone: string; // e.g., 'UTC', 'GMT'
  incidentType: IncidentType;
  threatType: ThreatType;
  reporterEmail: string;
  reporterName: string;
  reportNotes: string;
  anonymizeReport?: boolean;
  attackMethod?: string;
  source?: 'CertPortalV2' | 'ReportApi';
  severity?: 'High' | 'Medium' | 'Low';
  sourceIp?: string;
  sourcePort?: string;
  sourceUrl?: string;
  destinationIp?: string;
  destinationPort?: string;
  destinationUrl?: string;
  ipAddressList?: {
    sourceIp?: string;
    sourcePort?: string;
    destinationIp?: string;
    destinationPort?: string;
  }[];
  urlList?: {
    sourceUrl?: string;
    destinationUrl?: string;
  }[];
  reportedTenantId?: string; // uuid
  reportedSubscriptionId?: string; // uuid
  testSubmission?: boolean;
}
