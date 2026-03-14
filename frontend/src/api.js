// Central API client — all HTTP calls go through here

const BASE = '/api'

function getToken() {
  return localStorage.getItem('aq_token') || ''
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (username, password) => request('POST', '/auth/login', { username, password }),
    me:    ()                   => request('GET',  '/auth/me'),
  },

  // ── Bookings ───────────────────────────────────────────────────
  bookings: {
    list:         (params = {})    => request('GET',   '/bookings?' + new URLSearchParams(params)),
    get:          (id)             => request('GET',   `/bookings/${id}`),
    create:       (data)           => request('POST',  '/bookings', data),
    update:       (id, data)       => request('PUT',   `/bookings/${id}`, data),
    patchStatus:  (id, status)     => request('PATCH', `/bookings/${id}/status`, { status }),
    delete:       (id)             => request('DELETE',`/bookings/${id}`),
  },

  // ── Employees ──────────────────────────────────────────────────
  employees: {
    list:         (params = {})    => request('GET',   '/employees?' + new URLSearchParams(params)),
    get:          (id)             => request('GET',   `/employees/${id}`),
    create:       (data)           => request('POST',  '/employees', data),
    update:       (id, data)       => request('PUT',   `/employees/${id}`, data),
    patchStatus:  (id, status)     => request('PATCH', `/employees/${id}/status`, { status }),
    delete:       (id)             => request('DELETE',`/employees/${id}`),
  },
}
