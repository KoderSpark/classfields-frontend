const API_BASE = import.meta.env.VITE_API_URL ;

function buildQuery(params: Record<string, any>) {
  const s = new URLSearchParams();
  for (const k in params) {
    if (params[k] !== undefined && params[k] !== null && params[k] !== '') s.set(k, String(params[k]));
  }
  const q = s.toString();
  return q ? `?${q}` : '';
}

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
  const token = localStorage.getItem('provider_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let body: any = null;
    try { if (contentType.includes('application/json')) body = await res.json(); else body = await res.text(); } catch (e) {}
    const err = new Error(body?.error || body || res.statusText);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function getCategories() {
  return request('/api/categories');
}

export async function getProviders(filters: { category?: string; subcategory?: string; city?: string; search?: string; limit?: number; page?: number } = {}) {
  return request(`/api/providers${buildQuery(filters)}`);
}

export async function getProvider(id: string) {
  return request(`/api/providers/${id}`);
}

export async function createProvider(data: any) {
  return request('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function loginProvider(email: string, password: string) {
  return request('/api/providers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request('/api/providers/me');
}

export async function updateMe(data: any) {
  return request('/api/providers/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/uploads/image`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  const json = await res.json();
  return json.url || json.secure_url || json.url;
}

export type Provider = {
  id: string;
  business_name: string;
  contact_number: string;
  email: string;
  category: string;
  subcategory: string;
  city: string;
  subcity: string;
  description: string;
  profile_image_url?: string;
  created_at?: string;
  status?: string;
};

export type Category = {
  id?: string;
  name: string;
  subcategories: string[];
  created_at?: string;
};

export async function getAdminStats(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export async function getAdminProviders(token: string, params: { page?: number, limit?: number, search?: string }) {
  const q = buildQuery(params);
  const res = await fetch(`${API_BASE}/api/admin/providers${q}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin providers');
  return res.json();
}

export async function updateAdminProvider(token: string, id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/providers/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update provider' }));
    throw new Error(err.error || 'Failed to update provider');
  }
  return res.json();
}

export async function deleteAdminProvider(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/providers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete provider');
  return res.json();
}

export async function getAdminAnalytics(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin analytics');
  return res.json();
}

export default { getCategories, getProviders, getProvider, createProvider, uploadImage, loginProvider, getAdminStats, getAdminProviders, updateAdminProvider, deleteAdminProvider, getAdminAnalytics };
