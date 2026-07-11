import { createClient } from '@/utils/supabase/client';

// Resolve the API URL for both client and server environments
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function mapEndpointToEdgeFunction(endpoint: string, options: RequestInit = {}): { url: string; headers: Record<string, string>; useEdge: boolean } {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Create a URL object using dummy host to parse segments & query easily
  const dummyUrl = new URL(formattedEndpoint, 'http://localhost');
  const pathname = dummyUrl.pathname;
  const method = (options.method || 'GET').toUpperCase();

  let edgePath = '';
  const extraParams = new URLSearchParams();

  // 1. Public CMS Content mapping
  if (method === 'GET') {
    if (pathname === '/portfolio' || pathname === '/cms/portfolio') {
      edgePath = '/public-content/portfolio';
    } else if (pathname === '/services' || pathname === '/cms/services') {
      edgePath = '/public-content/services';
    } else if (pathname === '/team' || pathname === '/cms/team') {
      edgePath = '/public-content/team';
    } else if (pathname === '/blog' || pathname === '/cms/blog') {
      edgePath = '/public-content/blog';
    } else if (pathname === '/testimonials' || pathname === '/cms/testimonials') {
      edgePath = '/public-content/testimonials';
    } else if (pathname === '/faq' || pathname === '/cms/faq') {
      edgePath = '/public-content/faq';
    } else if (pathname === '/announcements' || pathname === '/cms/announcements') {
      edgePath = '/public-content/announcements';
    }
  }

  // 2. Talent mapping
  if (pathname === '/talent') {
    edgePath = '/talent';
    if (method === 'GET') {
      extraParams.set('action', 'list');
    }
  } else if (pathname === '/talent/featured' && method === 'GET') {
    edgePath = '/talent';
    extraParams.set('action', 'featured');
  } else if (pathname === '/talent/pending' && method === 'GET') {
    edgePath = '/talent';
    extraParams.set('action', 'pending');
  } else if (pathname === '/talent/me') {
    edgePath = '/talent';
    extraParams.set('action', 'me');
  } else if (pathname === '/talent/draft' && method === 'POST') {
    edgePath = '/talent';
    extraParams.set('action', 'draft');
  } else if (pathname === '/talent/submit' && method === 'POST') {
    edgePath = '/talent';
    extraParams.set('action', 'submit');
  } else if (pathname.startsWith('/talent/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 3 && parts[2] === 'moderate' && method === 'PATCH') {
      edgePath = '/talent';
      extraParams.set('action', 'moderate');
      extraParams.set('id', parts[1]);
    } else if (parts.length === 3 && parts[2] === 'hire' && method === 'POST') {
      edgePath = '/talent';
      extraParams.set('action', 'hire');
      extraParams.set('id', parts[1]);
    } else if (parts.length === 2 && !['me', 'draft', 'submit', 'pending', 'featured'].includes(parts[1])) {
      edgePath = '/talent';
      extraParams.set('action', 'get');
      extraParams.set('id', parts[1]);
    }
  }

  // 3. Casting Calls mapping
  if (pathname === '/bookings/casting-calls') {
    edgePath = '/casting-calls';
    if (method === 'POST') {
      extraParams.set('action', 'create');
    } else {
      extraParams.set('action', 'list');
    }
  } else if (pathname === '/casting-calls/apply' && method === 'POST') {
    edgePath = '/casting-calls';
    extraParams.set('action', 'apply');
  }

  // 4. Bookings mapping
  if (pathname === '/bookings') {
    edgePath = '/bookings';
    if (method === 'POST') {
      extraParams.set('action', 'create');
    } else {
      extraParams.set('action', 'list');
    }
  }

  // 5. Project Comments mapping
  if (pathname.startsWith('/client/projects/') && pathname.endsWith('/comments') && method === 'POST') {
    const parts = pathname.split('/').filter(Boolean);
    edgePath = '/project-comments';
    extraParams.set('projectId', parts[2]);
  } else if (pathname === '/project-comments') {
    edgePath = '/project-comments';
  }

  // 6. Admin Dashboard mapping
  if (pathname === '/admin/dashboard/kpis' && method === 'GET') {
    edgePath = '/admin-dashboard';
    extraParams.set('action', 'kpis');
  } else if (pathname === '/admin/users' && method === 'GET') {
    edgePath = '/admin-dashboard';
    extraParams.set('action', 'users');
  }

  if (edgePath) {
    const mergedParams = new URLSearchParams(dummyUrl.search);
    extraParams.forEach((val, key) => {
      mergedParams.set(key, val);
    });

    const queryString = mergedParams.toString();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmpeiobdilrgtuzggzuj.supabase.co';
    const functionsUrl = `${supabaseUrl}/functions/v1`;
    const fullUrl = `${functionsUrl}${edgePath}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };

    return { url: fullUrl, headers, useEdge: true };
  }

  return { url: `${API_URL}${formattedEndpoint}`, headers: {}, useEdge: false };
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = '';

  // The app authenticates with Supabase Auth. Send the Supabase access token so
  // the NestJS API (which validates Supabase JWTs) authorizes the request.
  if (typeof window !== 'undefined') {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    } catch {
      token = '';
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Map to Supabase Edge Functions if matching
  const mapped = mapEndpointToEdgeFunction(endpoint, config);

  const finalHeaders = {
    ...config.headers,
    ...mapped.headers,
  } as HeadersInit;

  const res = await fetch(mapped.url, {
    ...config,
    headers: finalHeaders,
  });
  
  if (!res.ok) {
    let errorMessage = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  
  return res.json();
}

