# MSRC Abuse Reporting Client

Web client for the [MSRC Abuse Reporting API v3.0](https://api.msrc.microsoft.com/report/v3.0/swagger/v2/swagger.json). Submit abuse reports for malicious activity from Microsoft infrastructure -- IPs, URLs, Azure subscriptions, impersonation, M365/W365, and gaming fraud. Includes a security updates browser with CVE lookup and CVRF document viewer.

## Quick Start

```bash
git clone https://github.com/lewiswigmore/msrc-report-client.git
cd msrc-report-client
npm install
npm run dev
```

Runs in **demo mode** by default. For production, set Azure AD env vars in `.env.local`:

```
NEXT_PUBLIC_AZURE_CLIENT_ID=<your-client-id>
NEXT_PUBLIC_AZURE_TENANT_ID=<your-tenant-id>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | Production | Azure AD application (client) ID |
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Production | Azure AD directory (tenant) ID |
| `NEXT_PUBLIC_REDIRECT_URI` | No | OAuth redirect URI (defaults to origin) |
| `NEXT_PUBLIC_MSRC_API_SCOPE` | No | Custom API scope |

## Azure AD Setup

1. Azure Portal > Microsoft Entra ID > App registrations > New registration
2. Platform: **Single-page application (SPA)**, redirect URI: `http://localhost:3000`
3. Copy the **Application (client) ID** and **Directory (tenant) ID** into `.env.local`

Scopes requested: `openid`, `profile`, `email`, `User.Read`.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/report` | POST | Submit abuse report |
| `/api/security/updates` | GET | List security updates |
| `/api/security/cve/[id]` | GET | CVE lookup |
| `/api/security/cvrf/[id]` | GET | CVRF document |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Open a pull request

## License

MIT -- see [LICENSE](LICENSE).

## References

- [MSRC Abuse Reporting API v3.0](https://api.msrc.microsoft.com/report/v3.0/swagger/v2/swagger.json)
- [MSRC Report Developer Documentation](https://msrc.microsoft.com/report/developer)
- [CVRF API](https://api.msrc.microsoft.com/cvrf/v3.0)

---

This is a community tool and is not officially supported by Microsoft.
