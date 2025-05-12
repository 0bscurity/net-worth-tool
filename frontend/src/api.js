import axios from 'axios'
import { getAccessTokenSilently } from '@auth0/auth0-react'

// base URL of your backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
})

// request interceptor to attach Auth0 token
api.interceptors.request.use(async (cfg) => {
  const token = await getAccessTokenSilently()
  cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
