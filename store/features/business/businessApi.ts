import { baseApi } from '@/store/api/baseApi'
import {
    type UpdateBusinessLogoArgs,
    type UpdateBusinessLogoResponse,
    type UpdateBusinessProfileDto,
    type UpdateBusinessProfileResponse,
} from '@/store/features/business/business.types'

export const businessApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        updateMyBusinessProfile: builder.mutation<UpdateBusinessProfileResponse, UpdateBusinessProfileDto>({
            query: (data) => ({
                url: '/business/me/profile',
                method: 'PATCH',
                data,
            }),
            invalidatesTags: ['Me', 'Profile'],
        }),
        updateMyBusinessLogo: builder.mutation<UpdateBusinessLogoResponse, UpdateBusinessLogoArgs>({
            query: (file) => {
                const formData = new FormData()
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any)

                return {
                    url: '/business/me/logo',
                    method: 'PUT',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            },
            invalidatesTags: ['Me', 'Profile'],
        }),
    }),
})

export const { useUpdateMyBusinessProfileMutation, useUpdateMyBusinessLogoMutation } = businessApi
