import { auth } from '@/auth';
import { API_URL, mapEndpointToEdgeFunction } from './api-client';

export async function serverFetchAPI(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  const token = (session as any)?.accessToken;

  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Determine if there is a body, and if it's an object/array, set JSON headers
  const isJsonBody = options.body && typeof options.body === 'string' && options.body.startsWith('{');
  if (isJsonBody || (!options.body && options.method && options.method !== 'GET')) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Map to Supabase Edge Functions if matching
  const tempOptions = {
    ...options,
    headers: Object.fromEntries(headers.entries()),
  };
  const mapped = mapEndpointToEdgeFunction(formattedEndpoint, tempOptions);

  if (mapped.useEdge && mapped.headers.apikey) {
    headers.set('apikey', mapped.headers.apikey);
  }

  const response = await fetch(mapped.url, {
    ...options,
    headers,
  });

  // Not returning JSON directly because sometimes we might just want to check `res.ok`
  // But for convenience we can return JSON or throw
  if (!response.ok) {
    // Attempt to parse error
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

