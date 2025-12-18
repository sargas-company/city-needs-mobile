import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { UploadItemKind, UploadSessionDto } from '@/services/onboarding/uploadSession.types'

export type UploadSessionStatusState = 'idle' | 'loading' | 'ready' | 'error'

type UploadSessionState = {
    session: UploadSessionDto | null
    status: UploadSessionStatusState
    error: string | null
}

const initialState: UploadSessionState = {
    session: null,
    status: 'idle',
    error: null,
}

const uploadSessionSlice = createSlice({
    name: 'uploadSession',
    initialState,
    reducers: {
        setUploadSession: (state, action: PayloadAction<UploadSessionDto | null>) => {
            state.session = action.payload
            state.status = action.payload ? 'ready' : 'idle'
            state.error = null
        },
        setUploadSessionStatus: (state, action: PayloadAction<UploadSessionStatusState>) => {
            state.status = action.payload
        },
        setUploadSessionError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
            state.status = 'error'
        },
    },
})

export const selectUploadSession = (state: { uploadSession: UploadSessionState }) => state.uploadSession.session
export const selectUploadSessionStatus = (state: { uploadSession: UploadSessionState }) => state.uploadSession.status
export const selectUploadSessionFilesByKind = (kind: UploadItemKind) => (state: { uploadSession: UploadSessionState }) =>
    state.uploadSession.session?.files.filter((f) => f.kind === kind) ?? []
export const selectUploadSessionLogoFile = (state: { uploadSession: UploadSessionState }) =>
    state.uploadSession.session?.files.find((f) => f.kind === 'LOGO') ?? null
export const selectUploadSessionPhotoFiles = (state: { uploadSession: UploadSessionState }) =>
    state.uploadSession.session?.files.filter((f) => f.kind === 'PHOTO') ?? []
export const selectUploadSessionDocumentFiles = (state: { uploadSession: UploadSessionState }) =>
    state.uploadSession.session?.files.filter((f) => f.kind === 'DOCUMENT') ?? []

export const { setUploadSession, setUploadSessionError, setUploadSessionStatus } = uploadSessionSlice.actions
export const uploadSessionReducer = uploadSessionSlice.reducer
