const API_BASE = 'http://127.0.0.1:3000';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('loan_officer_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loan_officer_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('loan_officer_token');
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = 'An error occurred';
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed.message || errorMsg;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  predict: (body: any) => request('/predict', { method: 'POST', body: JSON.stringify(body) }),
  getLogs: (limit?: number) => request(`/predict/logs${limit ? `?limit=${limit}` : ''}`, { method: 'GET' }),
  getLogDetails: (id: string) => request(`/predict/logs/${id}`, { method: 'GET' }),
};
