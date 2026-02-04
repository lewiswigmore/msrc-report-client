import { NextRequest, NextResponse } from 'next/server';

const MSRC_ENDPOINT = 'https://api.msrc.microsoft.com/report/v2.0/abuse';

// Valid incident and threat types for validation
const VALID_INCIDENT_TYPES = [
  'Brute Force',
  'Denial of Service',
  'Illegal/Violates the rights of others',
  'Malware',
  'Phishing',
  'Spam',
] as const;

const VALID_THREAT_TYPES = ['IP Address', 'URL', 'Azure Subscription'] as const;

// Basic input validation
function validateReportBody(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const report = body as Record<string, unknown>;

  // Required fields
  if (!report.incidentType || !VALID_INCIDENT_TYPES.includes(report.incidentType as typeof VALID_INCIDENT_TYPES[number])) {
    return { valid: false, error: 'Invalid or missing incidentType' };
  }

  if (!report.threatType || !VALID_THREAT_TYPES.includes(report.threatType as typeof VALID_THREAT_TYPES[number])) {
    return { valid: false, error: 'Invalid or missing threatType' };
  }

  if (!report.reporterEmail || typeof report.reporterEmail !== 'string' || !report.reporterEmail.includes('@')) {
    return { valid: false, error: 'Invalid or missing reporterEmail' };
  }

  if (!report.reporterName || typeof report.reporterName !== 'string' || report.reporterName.length < 1) {
    return { valid: false, error: 'Invalid or missing reporterName' };
  }

  if (!report.reportNotes || typeof report.reportNotes !== 'string') {
    return { valid: false, error: 'Invalid or missing reportNotes' };
  }

  // Validate date format (YYYY-MM-DD)
  if (!report.date || typeof report.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(report.date)) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Validate time format (HH:mm:ss)
  if (!report.time || typeof report.time !== 'string' || !/^\d{2}:\d{2}:\d{2}$/.test(report.time)) {
    return { valid: false, error: 'Invalid time format' };
  }

  return { valid: true };
}

// Validate Authorization header format
function validateAuthHeader(authHeader: string | null): boolean {
  if (!authHeader) return false;
  // Should be "Bearer <token>" format
  return authHeader.startsWith('Bearer ') && authHeader.length > 10;
}

export async function POST(req: NextRequest) {
  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!validateAuthHeader(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authorization token required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = validateReportBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Bad Request', message: validation.error },
        { status: 400 }
      );
    }

    // Forward the request to MSRC with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(MSRC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader!,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.text();
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch {
        jsonData = { message: data };
      }

      if (!response.ok) {
        // Log the full error server-side for debugging
        console.error('[MSRC API Error]', {
          status: response.status,
          details: jsonData,
        });

        // Return sanitized error to client
        return NextResponse.json(
          { error: 'Failed to submit report', status: response.status },
          { status: response.status }
        );
      }

      return NextResponse.json(jsonData, { status: 200 });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    // Log the full error server-side
    console.error('[API Route Error]', error);

    // Return generic error to client (don't expose internal details)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
