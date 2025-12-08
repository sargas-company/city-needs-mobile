import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios'

import { clearSession, getAccessToken, getRefreshToken, persistTokens } from '../auth/session'
import { apiConfig } from './config'
import { ApiError } from './errors'
import { AuthTokens } from './types'

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const apiClient: AxiosInstance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

const refreshClient: AxiosInstance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
})

let isRefreshing = false
let pendingQueue: ((token: string) => void)[] = []
let pendingRejectors: ((error: unknown) => void)[] = []

const processQueue = (error: unknown, token: string | null) => {
    if (token) {
        pendingQueue.forEach((callback) => callback(token))
    }

    if (error) {
        pendingRejectors.forEach((reject) => reject(error))
    }

    pendingQueue = []
    pendingRejectors = []
}

const toApiError = (error: unknown): ApiError => {
    if (error instanceof ApiError) {
        return error
    }

    if (isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; code?: string } | undefined
        return new ApiError({
            message: responseData?.message ?? error.message,
            code: responseData?.code ?? error.code,
            status: error.response?.status,
            data: responseData,
        })
    }

    if (error instanceof Error) {
        return new ApiError({ message: error.message })
    }

    return new ApiError({ message: 'Unknown error' })
}

const refreshTokens = async (): Promise<AuthTokens> => {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
        throw new ApiError({ message: 'Session expired', status: 401 })
    }

    const response = await refreshClient.post<AuthTokens>('/refresh', { refreshToken })
    const tokens = response.data

    if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new ApiError({ message: 'Invalid refresh response', status: 500, data: tokens })
    }

    await persistTokens(tokens)
    return tokens
}

const attachAuthHeader = (config: InternalAxiosRequestConfig, token: string | null): InternalAxiosRequestConfig => {
    if (!token) {
        return config
    }

    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers ?? {})

    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
    return config
}

apiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken()
    return attachAuthHeader(config, token)
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AuthenticatedRequestConfig | undefined
        const status = error.response?.status

        if (status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push((token: string) => {
                        const requestWithAuth = attachAuthHeader(originalRequest, token)
                        resolve(apiClient(requestWithAuth))
                    })
                    pendingRejectors.push(reject)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const tokens = await refreshTokens()
                processQueue(null, tokens.accessToken)

                const requestWithAuth = attachAuthHeader(originalRequest, tokens.accessToken)
                return apiClient(requestWithAuth)
            } catch (refreshError) {
                processQueue(refreshError, null)
                await clearSession()
                throw toApiError(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        throw toApiError(error)
    }
)

export { apiClient }
