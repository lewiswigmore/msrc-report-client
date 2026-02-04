import { NextRequest, NextResponse } from 'next/server';

const MSRC_CVRF_BASE = 'https://api.msrc.microsoft.com/cvrf/v3.0';

export interface SecurityUpdate {
  ID: string;
  Alias: string;
  DocumentTitle: string;
  Severity: string | null;
  InitialReleaseDate: string;
  CurrentReleaseDate: string;
  CvrfUrl: string;
}

export interface UpdatesResponse {
  '@odata.context'?: string;
  value: SecurityUpdate[];
  totalCount?: number;
}

/**
 * GET /api/security/updates
 * 
 * Fetches Microsoft security update summaries from the MSRC CVRF API.
 * Note: The MSRC API does not support OData query parameters ($orderby, $top, etc.)
 * so we handle sorting and pagination on the server side.
 * 
 * Query Parameters:
 * - year: Filter by year (e.g., 2024)
 * - cve: Filter by CVE ID (e.g., CVE-2024-12345)
 * - id: Filter by update ID
 * - orderby: Field to order by (e.g., CurrentReleaseDate)
 * - order: Sort order ('asc' or 'desc', default 'desc')
 * - top: Limit number of results (default 50)
 * - skip: Skip number of results (for pagination)
 * - search: Search in DocumentTitle
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Build the API URL - Note: MSRC API does not support OData parameters
    let apiUrl = `${MSRC_CVRF_BASE}/updates`;
    
    // Check for key-based filtering (year or CVE or specific ID)
    const year = searchParams.get('year');
    const cve = searchParams.get('cve');
    const updateId = searchParams.get('id');
    
    if (year || cve || updateId) {
      const key = year || cve || updateId;
      apiUrl = `${MSRC_CVRF_BASE}/updates('${encodeURIComponent(key!)}')`;
    }

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
      console.error('[MSRC CVRF API Error]', {
        status: response.status,
        url: apiUrl,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch security updates', status: response.status },
        { status: response.status }
      );
    }

    const data: UpdatesResponse = await response.json();
    let updates = data.value || [];
    
    // Apply search filter (case-insensitive)
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      updates = updates.filter(u => 
        u.DocumentTitle?.toLowerCase().includes(searchLower) ||
        u.ID?.toLowerCase().includes(searchLower) ||
        u.Alias?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply year filter if searching within results
    const yearFilter = searchParams.get('yearFilter');
    if (yearFilter) {
      updates = updates.filter(u => u.ID?.startsWith(yearFilter));
    }
    
    // Store total count before pagination
    const totalCount = updates.length;
    
    // Apply sorting (handle both OData-style and simple params)
    const orderbyOdata = searchParams.get('$orderby');
    const orderby = searchParams.get('orderby') || orderbyOdata;
    
    if (orderby) {
      // Parse OData-style orderby like "CurrentReleaseDate desc"
      const parts = orderby.split(' ');
      const field = parts[0] as keyof SecurityUpdate;
      const orderParam = searchParams.get('order');
      const order = parts[1] || orderParam || 'desc';
      
      updates.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        // Handle date fields
        if (field.includes('Date')) {
          const aDate = new Date(aVal as string).getTime();
          const bDate = new Date(bVal as string).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        
        // String comparison
        const comparison = String(aVal).localeCompare(String(bVal));
        return order === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default: sort by CurrentReleaseDate descending
      updates.sort((a, b) => {
        const aDate = new Date(a.CurrentReleaseDate).getTime();
        const bDate = new Date(b.CurrentReleaseDate).getTime();
        return bDate - aDate;
      });
    }
    
    // Apply pagination (handle both OData-style and simple params)
    const skipOdata = searchParams.get('$skip');
    const topOdata = searchParams.get('$top');
    const skip = parseInt(searchParams.get('skip') || skipOdata || '0', 10);
    const top = parseInt(searchParams.get('top') || topOdata || '50', 10);
    
    updates = updates.slice(skip, skip + top);
    
    return NextResponse.json({
      ...data,
      value: updates,
      totalCount,
    }, {
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

    console.error('[Security Updates API Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
