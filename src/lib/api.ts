// src/lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'; // backend URL in dev

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If path is relative, prefix with API_BASE. If someone passes a full URL, use it as-is.
  const url = path.startsWith('http')
    ? path
    : `${API_BASE.replace(/\/$/, '')}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore if no JSON
  }

  if (!res.ok) {
    const msg = data?.error ?? `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
