import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { refresh } from '@/services/auth/auth.service'
import { AuthTokens } from '@/services/auth/auth.types'
import { clearTokens, getTokens, setTokens } from '@/services/auth/session'
import { clearProfile } from '@/store/profile/profile.slice'
import { store } from '@/store'

import { apiConfig } from './config'
import { ApiError, toApiError } from './errors'
import { ApiAuthRequestConfig } from './types'

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & ApiAuthRequestConfig

let refreshPromise: Promise<AuthTokens> | null = null

const apiClient: AxiosInstance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

const isRefreshRequest = (config?: InternalAxiosRequestConfig) =>
    config?.url?.includes('/auth/refresh') || config?.url?.includes('/auth/login') || config?.url?.includes('/auth/sign-up')

const attachAuthHeader = (config: InternalAxiosRequestConfig, token: string | null): InternalAxiosRequestConfig => {
    if (!token) {
        return config
    }

    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers ?? {})
    config.headers = headers
    headers.set('Authorization', `Bearer ${token}`)
    return config
}

apiClient.interceptors.request.use(async (config) => {
    const tokens = await getTokens()
    const accessToken = tokens?.accessToken ?? null
    return attachAuthHeader(config, accessToken)
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AuthenticatedRequestConfig | undefined
        if (!originalRequest) {
            throw toApiError(error)
        }

        if (isRefreshRequest(originalRequest) || originalRequest._retry) {
            await clearTokens()
            store.dispatch(clearProfile())
            throw toApiError(error)
        }

        if (error.response?.status !== 401) {
            throw toApiError(error)
        }

        const tokens = await getTokens()
        if (!tokens?.refreshToken) {
            await clearTokens()
            store.dispatch(clearProfile())
            throw new ApiError({ message: 'Session expired', status: 401 })
        }

        if (!refreshPromise) {
            refreshPromise = (async () => {
                try {
                    const newTokens = await refresh(tokens.refreshToken)
                    await setTokens(newTokens)
                    return newTokens
                } catch (refreshError) {
                    await clearTokens()
                    store.dispatch(clearProfile())
                    throw refreshError
                } finally {
                    refreshPromise = null
                }
            })()
        }

        const newTokens = await refreshPromise
        originalRequest._retry = true
        const requestWithAuth = attachAuthHeader(originalRequest, newTokens.accessToken)
        return apiClient(requestWithAuth)
    }
)

export { apiClient }
