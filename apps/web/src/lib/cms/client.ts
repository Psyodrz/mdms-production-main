'use client';

/**
 * Client helpers for the CMS admin. All calls go to same-origin `/api/cms/*`
 * BFF routes (never directly to the API), so the browser never handles service
 * credentials or tokens.
 */

export interface CmsResult<T = unknown> {
  ok: boolean;
  data: T | null;
  error?: string;
  status?: number;
}

async function request<T = unknown>(url: string, init?: RequestInit): Promise<CmsResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const json = await res.json().catch(() => null);
    if (json && typeof json === 'object' && 'ok' in json) {
      return {
        ok: Boolean(json.ok),
        data: (json.data ?? null) as T | null,
        error: json.error,
        status: res.status,
      };
    }
    return { ok: res.ok, data: json as T, status: res.status };
  } catch {
    return { ok: false, data: null, error: 'Network error — is the API running?' };
  }
}

export const cms = {
  list: <T = unknown[]>(resource: string) => request<T>(`/api/cms/${resource}`),

  create: <T = unknown>(resource: string, body: Record<string, unknown>) =>
    request<T>(`/api/cms/${resource}`, { method: 'POST', body: JSON.stringify(body) }),

  update: <T = unknown>(resource: string, id: string, body: Record<string, unknown>) =>
    request<T>(`/api/cms/${resource}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  remove: <T = unknown>(resource: string, id: string) =>
    request<T>(`/api/cms/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  recycleBin: <T = unknown[]>() => request<T>(`/api/cms/recycle-bin`),

  restore: (modelType: string, id: string) =>
    request(`/api/cms/recycle-bin/${encodeURIComponent(modelType)}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
    }),

  purge: (modelType: string, id: string) =>
    request(`/api/cms/recycle-bin/${encodeURIComponent(modelType)}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getConfig: <T = unknown>(key: string) => request<T>(`/api/cms/config/${encodeURIComponent(key)}`),

  setConfig: (key: string, value: unknown, type = 'json') =>
    request(`/api/cms/config/${encodeURIComponent(key)}`, {
      method: 'POST',
      body: JSON.stringify({ value, type }),
    }),
};
