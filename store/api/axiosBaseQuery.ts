import { BaseQueryFn } from '@reduxjs/toolkit/query'
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { getTokens, setTokens, clearTokens } from '@/services/auth/session'
import { refresh } from '@/services/auth/auth.service'
import { AuthTokens } from '@/services/auth/auth.types'
import { ApiError } from '@/services/api/errors'

export type AxiosBaseQueryArgs = {
    url: string
    method?: AxiosRequestConfig['method']
    data?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
}

let refreshPromise: Promise<AuthTokens> | null = null

const attachAuthHeader = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    const tokens = await getTokens()
    const accessToken = tokens?.accessToken ?? null
    const mergedHeaders = {
        ...(config.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }
    return { ...config, headers: mergedHeaders }
}

export const axiosBaseQuery =
    ({ client }: { client: AxiosInstance }): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
    async ({ url, method = 'GET', data, params, headers }) => {
        try {
            const config = await attachAuthHeader({ url, method, data, params, headers })
            const result = await client(config)
            return { data: result.data }
        } catch (axiosError) {
            const err = axiosError as AxiosError
            if (err.response?.status === 401) {
                const tokens = await getTokens()
                if (!tokens?.refreshToken) {
                    await clearTokens()
                    return {
                        error: {
                            status: 401,
                            data: 'Session expired',
                        },
                    }
                }

                if (!refreshPromise) {
                    refreshPromise = (async () => {
                        try {
                            const newTokens = await refresh(tokens.refreshToken)
                            await setTokens(newTokens)
                            return newTokens
                        } catch (refreshError) {
                            await clearTokens()
                            throw refreshError
                        } finally {
                            refreshPromise = null
                        }
                    })()
                }

                try {
                    const newTokens = await refreshPromise
                    const retryConfig = await attachAuthHeader({ url, method, data, params, headers })
                    retryConfig.headers = {
                        ...(retryConfig.headers ?? {}),
                        Authorization: `Bearer ${newTokens.accessToken}`,
                    }
                    const retryResult = await client(retryConfig)
                    return { data: retryResult.data }
                } catch (refreshError) {
                    return {
                        error: {
                            status: 401,
                            data: (refreshError as ApiError)?.message ?? 'Unauthorized',
                        },
                    }
                }
            }

            const status = err.response?.status ?? 500
            return {
                error: {
                    status,
                    data: err.response?.data ?? err.message,
                },
            }
        }
    }
