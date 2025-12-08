import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { apiClient } from '@/services/api/http-client'
import { AuthUser } from '@/services/auth/auth.types'
import { clearUser, setAuthStatus, setUser } from '@/store/auth/auth.slice'

type BaseQueryArgs = {
    url: string
    method?: AxiosRequestConfig['method']
    data?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
}

const axiosBaseQuery =
    ({ client }: { client: AxiosInstance }): BaseQueryFn<BaseQueryArgs, unknown, unknown> =>
    async ({ url, method = 'GET', data, params, headers }) => {
        try {
            const result = await client({ url, method, data, params, headers })
            return { data: result.data }
        } catch (axiosError) {
            const err = axiosError as AxiosError
            return {
                error: {
                    status: err.response?.status ?? 500,
                    data: err.response?.data ?? err.message,
                },
            }
        }
    }

export const api = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ client: apiClient }),
    tagTypes: ['Me', 'User', 'AnyFutureEntity'],
    endpoints: (builder) => ({
        me: builder.query<AuthUser, void>({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['Me'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setUser(data))
                    dispatch(setAuthStatus('authenticated'))
                } catch (error: unknown) {
                    const status = (error as { error?: { status?: number } })?.error?.status
                    if (status === 401 || status === 403) {
                        dispatch(clearUser())
                        dispatch(setAuthStatus('unauthenticated'))
                    }
                }
            },
        }),
    }),
})

export const { useMeQuery } = api
