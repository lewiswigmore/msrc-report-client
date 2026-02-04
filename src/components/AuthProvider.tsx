'use client';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType, AuthenticationResult, EventMessage, AuthError } from '@azure/msal-browser';
import { msalConfig, isAuthConfigured, getAuthConfigInfo } from '@/lib/authConfig';
import { ReactNode, useEffect, useState } from 'react';

const msalInstance = new PublicClientApplication(msalConfig);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Log configuration status in development
    const configInfo = getAuthConfigInfo();
    if (configInfo.isDevelopment) {
      console.info('[AuthProvider] Configuration:', {
        clientIdConfigured: configInfo.hasClientId,
        tenantIdConfigured: configInfo.hasTenantId,
        customScopeConfigured: configInfo.hasCustomScope,
        redirectUri: configInfo.redirectUri,
      });
    }

    // Check if auth is properly configured
    if (!isAuthConfigured()) {
      console.error('[AuthProvider] Azure AD not configured. Check environment variables.');
      setInitError('Authentication not configured. Please set NEXT_PUBLIC_AZURE_CLIENT_ID and NEXT_PUBLIC_AZURE_TENANT_ID.');
      setIsInitialized(true);
      return;
    }

    // Register event callbacks for logging
    const callbackId = msalInstance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        console.info('[AuthProvider] Login successful:', payload.account?.username);
      } else if (event.eventType === EventType.LOGOUT_SUCCESS) {
        console.info('[AuthProvider] Logout successful');
      } else if (event.eventType === EventType.LOGOUT_FAILURE) {
        console.error('[AuthProvider] Logout failed:', event.error?.message);
      } else if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        console.info('[AuthProvider] Token acquired successfully');
      } else if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
        console.error('[AuthProvider] Token acquisition failed:', event.error?.message);
        // Log additional error details in development
        if (configInfo.isDevelopment && event.error) {
          const authError = event.error as AuthError;
          console.error('[AuthProvider] Error details:', {
            errorCode: authError.errorCode,
            errorMessage: authError.message,
            subError: (authError as any).subError,
          });
        }
      }
    });

    // Initialize MSAL and handle redirect
    msalInstance.initialize().then(() => {
      return msalInstance.handleRedirectPromise();
    }).then((response) => {
      if (response) {
        console.info('[AuthProvider] Redirect handled successfully');
      }
      setIsInitialized(true);
    }).catch((error) => {
      console.error('[AuthProvider] MSAL initialization error:', {
        message: error.message,
        errorCode: error.errorCode,
        stack: configInfo.isDevelopment ? error.stack : undefined,
      });
      setInitError(error.message || 'Failed to initialize authentication');
      setIsInitialized(true);
    });

    // Cleanup event callback on unmount
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] flex items-center justify-center">
        <div className="text-center">
          <svg viewBox="0 0 23 23" className="w-16 h-16 mx-auto mb-4 animate-pulse" aria-label="Microsoft Logo">
            <rect x="0" y="0" width="10" height="10" fill="#f25022"></rect>
            <rect x="12" y="0" width="10" height="10" fill="#7fba00"></rect>
            <rect x="0" y="12" width="10" height="10" fill="#00a4ef"></rect>
            <rect x="12" y="12" width="10" height="10" fill="#ffb900"></rect>
          </svg>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg p-8 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-[#0078d4] hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
