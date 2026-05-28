import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Routes that should NOT trigger refresh
/*const skipRefreshRoutes = [
  '/users/login',
  '/users/register',
  '/users/refresh-access-token'
]

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip refresh for auth routes
    const shouldSkip = skipRefreshRoutes.some(route => 
      originalRequest.url?.includes(route)
    )

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkip
    ) {
      originalRequest._retry = true

      try {
        await axios.post('/api/v1/users/refresh-access-token', {}, {
          withCredentials: true
        })
        return api(originalRequest)

      } catch (refreshError) {
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)*/

/*import axios from 'axios'

const api = axios.create({
  baseURL: 'https://project-1-event-management-and-tick.vercel.app/api/v1',
  withCredentials: true,
})*/

export default api