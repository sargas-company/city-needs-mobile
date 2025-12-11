import { baseApi } from '@/store/api/baseApi'
import { AppUser } from '@/store/features/profile/profile.types'

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        me: builder.query<AppUser, void>({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['Me', 'Profile'],
        }),
        authSync: builder.mutation<AppUser, Partial<AppUser>>({
            query: (body) => ({ url: '/auth/sync', method: 'POST', data: body ?? {} }),
            invalidatesTags: ['Profile', 'Me'],
        }),
        sendVerificationEmail: builder.mutation<{ message?: string } | null, void>({
            query: () => ({ url: '/auth/send-verification-email', method: 'POST' }),
        }),
    }),
})

export const { useMeQuery, useAuthSyncMutation, useSendVerificationEmailMutation } = authApi
