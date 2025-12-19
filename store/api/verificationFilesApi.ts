import { baseApi } from '@/store/api/baseApi'
import {
    DeleteVerificationFileResponse,
    GetCurrentVerificationFileResponse,
    SignedUrlResponse,
    UploadVerificationFileResponse,
} from '@/store/features/onboarding/verify/verificationFile.types'

type UploadArgs = {
    file: {
        uri: string
        name: string
        type: string
    }
}

export const verificationFilesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentVerificationFile: builder.query<GetCurrentVerificationFileResponse, void>({
            query: () => ({
                url: '/onboarding/verification-file/current',
                method: 'GET',
            }),
            providesTags: ['VerificationFile'],
        }),
        uploadVerificationFile: builder.mutation<UploadVerificationFileResponse, UploadArgs>({
            query: ({ file }) => {
                const formData = new FormData()
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any)
                return {
                    url: '/onboarding/verification-file',
                    method: 'POST',
                    data: formData,
                }
            },
            invalidatesTags: ['VerificationFile'],
        }),
        deleteVerificationFile: builder.mutation<DeleteVerificationFileResponse, string>({
            query: (id) => ({
                url: `/onboarding/verification-file/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['VerificationFile'],
        }),
        getSignedUrl: builder.query<SignedUrlResponse, string>({
            query: (id) => ({
                url: `/files/${id}/signed-url`,
                method: 'GET',
            }),
        }),
    }),
})

export const { useGetCurrentVerificationFileQuery, useUploadVerificationFileMutation, useDeleteVerificationFileMutation, useLazyGetSignedUrlQuery } =
    verificationFilesApi
