export type IncidentType =
  | 'Brute Force'
  | 'Denial of Service'
  | 'Illegal/Violates the rights of others'
  | 'Malware'
  | 'Phishing'
  | 'Spam'
  | 'Azure Account Compromise'
  | 'Malicious Artifact'
  | 'Malicious Text or URL'
  | 'Responsible AI'
  | 'Impersonation Email Name'
  | 'Impersonation Domain Url'
  | 'Impersonation Typo Squatting'
  | 'M365 Account Compromise'
  | 'W365 Account Compromise'
  | 'Arbitrage Abuse'
  | 'Account Takeover'
  | 'Disposable MSA/Entitlement Stacking'
  | 'Perks Harvesting'
  | 'Refund Abuse'
  | 'CSV (Currency Stored Value) Abuse'
  | 'Developer Fraud'
  | 'Other Gaming';

export type ThreatType =
  | 'IP Address'
  | 'URL'
  | 'Community Gallery'
  | 'Azure Subscription'
  | 'Impersonation'
  | 'M365 Investigation'
  | 'W365 Investigation'
  | 'Gaming';

export type ArtifactType = 'VmImage' | 'VmApplication';

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
  phoneNumber?: string;
  reporterNotes?: string;
  reporterOrg?: string;
  attachmentId?: string;
  attachmentFileName?: string;
  icmNumber?: string;
  subscriptionId?: string; // uuid
  publicGalleryName?: string;
  artifactType?: ArtifactType;
  artifactName?: string;
  artifactVersion?: string;
  impersonationEmailName?: string;
  impersonationDomainUrl?: string;
  impersonationTypoSquatting?: string;
  msa?: string;
  region?: string;
  developer?: string;
  gameTitle?: string;
}
