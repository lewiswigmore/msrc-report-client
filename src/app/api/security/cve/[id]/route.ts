import { NextRequest, NextResponse } from 'next/server';

const MSRC_CVRF_BASE = 'https://api.msrc.microsoft.com/cvrf/v3.0';

export interface CVEUpdate {
  ID: string;
  Alias: string;
  DocumentTitle: string;
  Severity: string | null;
  InitialReleaseDate: string;
  CurrentReleaseDate: string;
  CvrfUrl: string;
}

/**
 * GET /api/security/cve/[id]
 * 
 * Fetches security updates related to a specific CVE.
 * 
 * Path Parameters:
 * - id: CVE ID (e.g., CVE-2024-12345)
 * 
 * Example: /api/security/cve/CVE-2024-12345
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate CVE ID format
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    if (!cvePattern.test(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid CVE ID format',
          message: 'CVE ID must be in format CVE-yyyy-nnnnn (e.g., CVE-2024-12345)',
        },
        { status: 400 }
      );
    }

    // Normalize CVE ID to uppercase
    const normalizedCVE = id.toUpperCase();
    const apiUrl = `${MSRC_CVRF_BASE}/updates('${encodeURIComponent(normalizedCVE)}')`;

    // Fetch from MSRC API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'CVE not found',
            cve: normalizedCVE,
            message: 'No Microsoft security updates found for this CVE',
          },
          { status: 404 }
        );
      }

      console.error('[MSRC CVE API Error]', {
        status: response.status,
        cve: normalizedCVE,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch CVE data', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Enhance response with CVE-specific metadata
    const enhancedResponse = {
      cve: normalizedCVE,
      updates: data.value || [],
      totalUpdates: data.value?.length || 0,
      ...data,
    };
    
    return NextResponse.json(enhancedResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }

    console.error('[CVE API Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
