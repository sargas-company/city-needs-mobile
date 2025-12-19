import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { VerificationFile } from '@/store/features/onboarding/verify/verificationFile.types'

export type VerifyStatus = 'idle' | 'loading' | 'ready' | 'error' | 'submitting'

type VerifyState = {
    file: VerificationFile | null
    status: VerifyStatus
    error: string | null
}

const initialState: VerifyState = {
    file: null,
    status: 'idle',
    error: null,
}

const verifySlice = createSlice({
    name: 'verify',
    initialState,
    reducers: {
        setVerifyStatus: (state, action: PayloadAction<VerifyStatus>) => {
            state.status = action.payload
        },
        setVerifyError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
            if (action.payload) {
                state.status = 'error'
            }
        },
        setVerifyFile: (state, action: PayloadAction<VerificationFile | null>) => {
            state.file = action.payload
            state.status = 'ready'
            state.error = null
        },
        clearVerify: () => initialState,
    },
})

export const { setVerifyStatus, setVerifyError, setVerifyFile, clearVerify } = verifySlice.actions
export const verifyReducer = verifySlice.reducer
