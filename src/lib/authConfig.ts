import { Configuration, PopupRequest, LogLevel } from "@azure/msal-browser";

// Environment variable configuration with validation
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "";
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "";
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");

// Optional: Custom API scope (if you have a registered API)
const msrcApiScope = process.env.NEXT_PUBLIC_MSRC_API_SCOPE || "";

// Logging configuration based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const enableLogging = process.env.NEXT_PUBLIC_ENABLE_AUTH_LOGGING === 'true' || isDevelopment;

// Validate required configuration
if (typeof window !== 'undefined') {
  if (!clientId) {
    console.error("[Auth Config] Missing NEXT_PUBLIC_AZURE_CLIENT_ID environment variable");
  }
  if (!tenantId) {
    console.error("[Auth Config] Missing NEXT_PUBLIC_AZURE_TENANT_ID environment variable");
  }
}

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      logLevel: enableLogging ? LogLevel.Verbose : LogLevel.Error,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return; // Never log PII
        
        const logPrefix = "[MSAL]";
        switch (level) {
          case LogLevel.Error:
            console.error(`${logPrefix} ${message}`);
            break;
          case LogLevel.Warning:
            console.warn(`${logPrefix} ${message}`);
            break;
          case LogLevel.Info:
            if (enableLogging) console.info(`${logPrefix} ${message}`);
            break;
          case LogLevel.Verbose:
            if (enableLogging) console.debug(`${logPrefix} ${message}`);
            break;
        }
      },
      piiLoggingEnabled: false,
    },
  },
};

// Scopes for authentication
// Using Microsoft Graph basic scopes for user authentication
// The MSRC abuse reporting will use the obtained token for authorization
export const loginRequest: PopupRequest = {
  scopes: msrcApiScope 
    ? [msrcApiScope] 
    : ["openid", "profile", "email", "User.Read"],
};

// Export config validation helper
export const isAuthConfigured = (): boolean => {
  return Boolean(clientId && tenantId);
};

// Export environment info for debugging
export const getAuthConfigInfo = () => ({
  hasClientId: Boolean(clientId),
  hasTenantId: Boolean(tenantId),
  hasCustomScope: Boolean(msrcApiScope),
  redirectUri,
  isDevelopment,
  loggingEnabled: enableLogging,
});
