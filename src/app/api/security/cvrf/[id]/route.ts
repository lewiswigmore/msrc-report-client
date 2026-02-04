import { NextRequest, NextResponse } from 'next/server';

const MSRC_CVRF_BASE = 'https://api.msrc.microsoft.com/cvrf/v3.0';

/**
 * GET /api/security/cvrf/[id]
 * 
 * Fetches detailed Microsoft security update in CVRF format.
 * 
 * Path Parameters:
 * - id: CVRF document ID in format yyyy-mmm (e.g., 2024-Jan, 2024-Feb)
 * 
 * Example: /api/security/cvrf/2024-Jan
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID format (yyyy-mmm)
    const idPattern = /^\d{4}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i;
    if (!idPattern.test(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid CVRF document ID format',
          message: 'ID must be in format yyyy-mmm (e.g., 2024-Jan)',
        },
        { status: 400 }
      );
    }

    const apiUrl = `${MSRC_CVRF_BASE}/cvrf/${encodeURIComponent(id)}`;

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
          { error: 'CVRF document not found', id },
          { status: 404 }
        );
      }

      console.error('[MSRC CVRF API Error]', {
        status: response.status,
        id,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch CVRF document', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
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

    console.error('[CVRF API Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
