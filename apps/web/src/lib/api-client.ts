import { createClient } from '@/utils/supabase/client';

// Resolve the API URL for both client and server environments
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

  // Ensure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_URL}${formattedEndpoint}`, config);
  
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
