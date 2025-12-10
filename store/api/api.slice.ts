import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { apiClient } from '@/services/api/http-client'
import { clearUser, setAuthStatus } from '@/store/auth/auth.slice'
import { setProfileError, setProfileStatus, setProfileUser } from '@/store/profile/profile.slice'
import { AppUser } from '@/store/profile/profile.types'

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
    tagTypes: ['Me', 'User', 'AnyFutureEntity', 'Profile'],
    endpoints: (builder) => ({
        me: builder.query<AppUser, void>({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['Me', 'Profile'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(setProfileStatus('loading'))
                try {
                    const { data } = await queryFulfilled
                    dispatch(setProfileUser(data))
                    dispatch(setAuthStatus('authenticated'))
                    dispatch(setProfileStatus('ready'))
                } catch (error: unknown) {
                    const status = (error as { error?: { status?: number; data?: any } })?.error?.status
                    if (status === 401 || status === 403) {
                        dispatch(clearUser())
                        dispatch(setAuthStatus('unauthenticated'))
                        dispatch(setProfileStatus('idle'))
                    } else {
                        dispatch(setProfileError('Failed to load profile'))
                        dispatch(setProfileStatus('error'))
                    }
                }
            },
        }),
        authSync: builder.mutation<AppUser, Partial<AppUser>>({
            query: (body) => ({ url: '/auth/sync', method: 'POST', data: body ?? {} }),
            invalidatesTags: ['Profile', 'Me'],
        }),
    }),
})

export const { useMeQuery } = api
