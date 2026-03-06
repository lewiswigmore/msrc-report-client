import { IncidentType, ThreatType } from '@/types/abuse-report';

export const INCIDENT_TYPES: IncidentType[] = [
  'Brute Force',
  'Denial of Service',
  'Malware',
  'Illegal/Violates the rights of others',
  'Phishing',
  'Spam',
  'Azure Account Compromise',
  'Malicious Artifact',
  'Malicious Text or URL',
  'Responsible AI',
  'Impersonation Email Name',
  'Impersonation Domain Url',
  'Impersonation Typo Squatting',
  'M365 Account Compromise',
  'W365 Account Compromise',
  'Arbitrage Abuse',
  'Account Takeover',
  'Disposable MSA/Entitlement Stacking',
  'Perks Harvesting',
  'Refund Abuse',
  'CSV (Currency Stored Value) Abuse',
  'Developer Fraud',
  'Other Gaming',
];

export const THREAT_TYPES: ThreatType[] = [
  'IP Address',
  'URL',
  'Community Gallery',
  'Azure Subscription',
  'Impersonation',
  'M365 Investigation',
  'W365 Investigation',
  'Gaming',
];

export const INCIDENT_THREAT_MAP: Record<string, ThreatType[]> = {
  'Brute Force': ['IP Address'],
  'Denial of Service': ['IP Address'],
  'Malware': ['IP Address', 'URL'],
  'Phishing': ['URL'],
  'Spam': ['IP Address'],
  'Illegal/Violates the rights of others': ['IP Address', 'URL'],
  'Azure Account Compromise': ['Azure Subscription'],
  'Malicious Artifact': ['Community Gallery'],
  'Malicious Text or URL': ['URL'],
  'Responsible AI': ['URL'],
  'Impersonation Email Name': ['Impersonation'],
  'Impersonation Domain Url': ['Impersonation'],
  'Impersonation Typo Squatting': ['Impersonation'],
  'M365 Account Compromise': ['M365 Investigation'],
  'W365 Account Compromise': ['W365 Investigation'],
  'Arbitrage Abuse': ['Gaming'],
  'Account Takeover': ['Gaming'],
  'Disposable MSA/Entitlement Stacking': ['Gaming'],
  'Perks Harvesting': ['Gaming'],
  'Refund Abuse': ['Gaming'],
  'CSV (Currency Stored Value) Abuse': ['Gaming'],
  'Developer Fraud': ['Gaming'],
  'Other Gaming': ['Gaming'],
};

export const TIME_ZONES = [
  'GMT', 'UTC', 'PST', 'PDT', 'EST', 'EDT', 'CST', 'CDT', 'MST', 'MDT', 'IST', 'CET', 'JST',
];

export interface ThreatHint {
  label: string;
  placeholder: string;
}

export const THREAT_HINTS: Record<string, ThreatHint> = {
  'default': {
    label: 'Target List (One per line)',
    placeholder: 'Paste IPs, URLs, or Subscription IDs based on threat type.',
  },
  'IP Address': {
    label: 'IP Addresses (One per line)',
    placeholder: '192.168.1.5\n10.0.0.1\n203.0.113.42',
  },
  'URL': {
    label: 'URLs (One per line)',
    placeholder: 'https://malicious-site.com/login\nhttp://phishing.example.com\nhttps://fake-portal.net',
  },
  'Azure Subscription': {
    label: 'Azure Subscription IDs (One per line)',
    placeholder: '00000000-0000-0000-0000-000000000000\n11111111-1111-1111-1111-111111111111',
  },
  'Community Gallery': {
    label: 'Gallery Names (One per line)',
    placeholder: 'publicGalleryName1\npublicGalleryName2',
  },
  'Impersonation': {
    label: 'Impersonation Details (One per line)',
    placeholder: 'email@example.com or domain.com or typosquatting-domain.com',
  },
  'M365 Investigation': {
    label: 'M365 Account Details (One per line)',
    placeholder: 'user@contoso.com\nuser2@contoso.com',
  },
  'W365 Investigation': {
    label: 'W365 Account Details (One per line)',
    placeholder: 'user@contoso.com\nuser2@contoso.com',
  },
  'Gaming': {
    label: 'Gaming Details (One per line)',
    placeholder: 'MSA or gamertag or developer info',
  },
};
