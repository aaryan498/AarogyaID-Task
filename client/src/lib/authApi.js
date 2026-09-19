import { apiRequest } from './apiClient'

export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function register({ name, email, password, role }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password, role },
  })
}