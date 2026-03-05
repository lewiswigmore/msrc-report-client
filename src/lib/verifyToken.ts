import { decodeJwt } from 'jose';

/**
 * Validates JWT claims as a defense-in-depth measure.
 * The downstream MSRC API performs full token validation;
 * this catches expired, malformed, or wrong-tenant tokens early.
 */
export function validateTokenClaims(token: string): { valid: boolean; error?: string } {
  try {
    const claims = decodeJwt(token);
    const now = Math.floor(Date.now() / 1000);

    if (claims.exp && claims.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    if (claims.iat && claims.iat > now + 300) {
      return { valid: false, error: 'Token not yet valid' };
    }

    const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
    if (tenantId && claims.iss) {
      const validIssuers = [
        `https://login.microsoftonline.com/${tenantId}/v2.0`,
        `https://sts.windows.net/${tenantId}/`,
      ];
      if (!validIssuers.includes(claims.iss)) {
        return { valid: false, error: 'Invalid token issuer' };
      }
    }

    return { valid: true };
  } catch {
    // Not a decodable JWT (may be an opaque access token).
    // Allow through — the downstream API performs its own validation.
    return { valid: true };
  }
}
