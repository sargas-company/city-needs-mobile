import { baseApi } from '@/store/api/baseApi'
import { UploadItemKind, UploadSessionDto } from '@/services/onboarding/uploadSession.types'

type UploadSessionResponse = {
    session: UploadSessionDto
}

type UploadFileRequest = {
    kind: UploadItemKind
    file: {
        uri: string
        name: string
        type: string
    }
}

export const uploadSessionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrCreateDraft: builder.mutation<UploadSessionResponse, void>({
            query: () => ({
                url: '/onboarding/upload-session',
                method: 'POST',
            }),
        }),
        uploadFile: builder.mutation<UploadSessionResponse, UploadFileRequest>({
            query: ({ kind, file }) => {
                const formData = new FormData()
                formData.append('kind', kind)
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any)
                return {
                    url: '/onboarding/upload-session/files',
                    method: 'POST',
                    data: formData,
                }
            },
        }),
        deleteFile: builder.mutation<UploadSessionResponse, string>({
            query: (fileId) => ({
                url: `/onboarding/upload-session/files/${fileId}`,
                method: 'DELETE',
            }),
        }),
    }),
})

export const { useGetOrCreateDraftMutation, useUploadFileMutation, useDeleteFileMutation } = uploadSessionsApi
