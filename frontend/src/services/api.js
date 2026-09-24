const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const firstError = Object.values(data.errors || {}).flat()[0]
    throw new Error(firstError || data.message || 'Não foi possível concluir a solicitação.')
  }

  return data
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getDashboard: () => request('/dashboard'),
  listTickets: (params) => request(`/tickets?${new URLSearchParams(params)}`),
  getTicket: (id) => request(`/tickets/${id}`),
  saveTicket: (id, ticket) => request(id ? `/tickets/${id}` : '/tickets', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(ticket),
  }),
  listAttendants: () => request('/attendants'),
}
