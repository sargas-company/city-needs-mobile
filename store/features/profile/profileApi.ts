import { baseApi } from '@/store/api/baseApi'
import type { AppUser } from '@/store/features/profile/profile.types'

export type UpdateMeRequest = {
    username?: string
    email?: string
    phone?: string
    password?: string
}

export type UpdateMeResponse = {
    code?: number
    data: AppUser
    message?: string
}

export type UpdateAvatarResponse = {
    code?: number
    data: { id: string; url: string }
    message?: string
}

type UploadFileArgs = {
    uri: string
    name: string
    type: string
}

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        updateMe: builder.mutation<UpdateMeResponse, UpdateMeRequest>({
            query: (data) => ({
                url: '/users/me',
                method: 'PATCH',
                data,
            }),
            invalidatesTags: ['Me', 'Profile'],
        }),
        updateMyAvatar: builder.mutation<UpdateAvatarResponse, UploadFileArgs>({
            query: (file) => {
                const formData = new FormData()
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any)

                return {
                    url: '/users/me/avatar',
                    method: 'PUT',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            },
            invalidatesTags: ['Me', 'Profile'],
        }),
    }),
})

export const { useUpdateMeMutation, useUpdateMyAvatarMutation } = profileApi
