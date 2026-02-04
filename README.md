# MSRC Abuse Reporting Portal

A Next.js web application for submitting abuse reports to the Microsoft Security Response Center (MSRC) via the official Abuse Reporting API (`api.msrc.microsoft.com/report/v2.0/abuse`). Designed for security teams who need to report malicious activity originating from Microsoft-hosted infrastructure at scale.

## What This Tool Does

This application provides a web interface for the MSRC Abuse Reporting API, which accepts reports of malicious activity associated with:

- **IP Addresses** - Azure-hosted IPs involved in brute force attacks, DDoS, spam, or malware distribution
- **URLs** - Malicious URLs hosted on Microsoft infrastructure (phishing, malware hosting)

The MSRC API is publicly documented and available for use by any organization to report abuse. This tool adds authentication, validation, bulk submission capabilities, and a user-friendly interface on top of the raw API.

## Features

- **Azure AD Authentication** - Restrict access to users within your organization using Microsoft Entra ID (Azure AD)
- **Bulk Submission** - Submit multiple indicators (IPs and URLs) in a single session with configurable rate limiting
- **Input Validation** - Client-side and server-side validation of IP addresses and URLs before submission
- **Incident Classification** - Support for all MSRC incident types: Brute Force, Denial of Service, Malware, Phishing, Spam, Illegal Activity
- **Test Mode** - Submit with `testSubmission: true` to validate payloads without creating tickets
- **Security Updates Browser** - Query the MSRC CVRF API to browse Microsoft security bulletins and CVE information

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Azure AD Setup](#azure-ad-setup)
  - [Creating an App Registration](#creating-an-app-registration)
  - [Restricting Access to Your Organization](#restricting-access-to-your-organization)
  - [Configuring Permissions](#configuring-permissions)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Node.js** 18+ or later
- **Azure AD / Microsoft Entra ID** tenant (for authentication)
- Access to the MSRC Abuse Reporting API

## Quick Start

```bash
# Clone the repository
git clone https://github.com/lewiswigmore/msrc-report-client.git
cd msrc-report-client

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env.local
# Edit .env.local with your Azure AD values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Azure AD Setup

### Creating an App Registration

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
   - Select **App registrations** > **New registration**

2. **Configure the Registration**
   - **Name**: Give your app a descriptive name (e.g., "MSRC Abuse Reporter")
   - **Supported account types**: Select **"Accounts in this organizational directory only"** to restrict to your tenant
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:3000` (for development)

3. **Save the Values**
   After registration, note down:
   - **Application (client) ID** → `NEXT_PUBLIC_AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → `NEXT_PUBLIC_AZURE_TENANT_ID`

### Restricting Access to Your Organization

By selecting **"Accounts in this organizational directory only"** during app registration, only users from your Azure AD tenant can sign in. This effectively locks the application to your organization.

For additional security:

1. **User/Group Assignment**
   - Go to **Enterprise applications** in Azure Portal
   - Find your app and select it
   - Navigate to **Users and groups**
   - Click **Add user/group**
   - Assign specific users or security groups who should have access
   - Enable **"Assignment required?"** under **Properties** to enforce this

2. **Conditional Access (Azure AD Premium)**
   - Create Conditional Access policies to require:
     - MFA (Multi-Factor Authentication)
     - Compliant devices
     - Specific locations/IP ranges

### Configuring Permissions

The default configuration uses Microsoft Graph API for basic profile information. No additional API permissions are typically required for the MSRC API itself, as it uses bearer token authentication.

Default scopes requested:
- `openid` - OpenID Connect sign-in
- `profile` - User profile information
- `email` - User email address
- `User.Read` - Read user profile from Graph API

## Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | Yes | Application (client) ID from Azure AD |
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Yes | Directory (tenant) ID from Azure AD |
| `NEXT_PUBLIC_REDIRECT_URI` | No | OAuth redirect URI (defaults to current origin) |
| `NEXT_PUBLIC_MSRC_API_SCOPE` | No | Custom API scope if registered |
| `NEXT_PUBLIC_ENABLE_AUTH_LOGGING` | No | Enable verbose auth logging |

**Security Warning**: Never commit `.env.local` or any file containing real credentials. The `.gitignore` is configured to exclude these files.

## Usage

### Submitting Abuse Reports

1. **Sign In**: Authenticate with your organizational Microsoft account
2. **Reporter Information**: Your name and email are auto-populated from your account
3. **Classification**: 
   - Select the **Incident Type** (Phishing, Malware, Brute Force, etc.)
   - Select the **Threat Type** (IP Address or URL)
4. **Incident Details**: Provide description and evidence
5. **Bulk Targets**: Paste your list of targets (one per line)
   - IPs: `192.168.1.1`
   - URLs: `https://malicious-site.com`
6. **Submit**: Click "Submit Report" and monitor the logs

### Browsing Security Updates

Navigate to the **Security Updates** tab to:
- Browse Microsoft security bulletins
- Look up specific CVEs
- View CVRF documents

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/report` | POST | Submit abuse report to MSRC |
| `/api/security/updates` | GET | List security updates |
| `/api/security/cve/[id]` | GET | Get updates for a specific CVE |
| `/api/security/cvrf/[id]` | GET | Get CVRF document details |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── report/             # Abuse report submission endpoint
│   │   └── security/           # Security updates endpoints
│   │       ├── updates/
│   │       ├── cve/[id]/
│   │       └── cvrf/[id]/
│   ├── security/               # Security updates UI
│   └── page.tsx                # Main abuse reporting UI
├── components/
│   ├── AuthProvider.tsx        # MSAL authentication wrapper
│   └── Navigation.tsx          # Tab navigation
├── lib/
│   └── authConfig.ts           # Azure AD/MSAL configuration
├── types/
│   └── abuse-report.ts         # TypeScript definitions
└── middleware.ts               # Rate limiting & security headers
```

## Security Considerations

### Built-in Protections

- **Rate Limiting**: API routes are protected with per-IP rate limiting (30 req/min)
- **Security Headers**: `X-Content-Type-Options` and `X-Frame-Options` headers added
- **Input Validation**: All inputs validated server-side before forwarding to MSRC
- **No PII Logging**: MSAL configured to never log personally identifiable information
- **Session Storage**: Auth tokens stored in session storage (not persistent)

### Recommendations

1. **Enable HTTPS**: Always use HTTPS in production
2. **Use Conditional Access**: Implement MFA and device compliance policies
3. **Regular Audits**: Review Azure AD sign-in logs periodically
4. **Principle of Least Privilege**: Only assign access to users who need it
5. **Rotate Client Secrets**: If using client credentials flow (server-side)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard under Project Settings > Environment Variables.

### Azure Static Web Apps

```bash
# Install Azure CLI
az login

# Create and deploy
az staticwebapp create \
  --name your-app-name \
  --resource-group your-resource-group \
  --source . \
  --location "West US 2" \
  --branch main \
  --app-artifact-location ".next"
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## MSRC API Reference

This tool interfaces with the Microsoft Security Response Center APIs:

- **Abuse Reporting API**: `https://api.msrc.microsoft.com/report/v2.0/abuse`
- **CVRF API**: `https://api.msrc.microsoft.com/cvrf/v3.0`

For detailed API documentation, visit:
- [MSRC Report Developer Documentation](https://msrc.microsoft.com/report/developer)
- [CVRF API 3.0 Upgrade Announcement](https://www.microsoft.com/en-us/msrc/blog/2024/07/announcing-the-cvrf-api-3-0-upgrade)

---

**Disclaimer**: This is a community tool and is not officially supported by Microsoft. Use responsibly and in accordance with Microsoft's terms of service.
