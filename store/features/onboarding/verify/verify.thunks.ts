import { createAsyncThunk } from '@reduxjs/toolkit'

import { verificationFilesApi } from '@/store/api/verificationFilesApi'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { authApi } from '@/store/features/auth/authApi'
import { resolveApiData } from '@/store/features/auth/auth.thunks'
import { setProfileStatus, setProfileUser } from '@/store/features/profile/profile.slice'
import type { RootState } from '@/store/store'
import type { AppUser } from '@/store/features/profile/profile.types'

import type { DeleteVerificationFileResponse, GetCurrentVerificationFileResponse, UploadVerificationFileResponse } from './verificationFile.types'
import { setVerifyError, setVerifyFile, setVerifyStatus } from './verify.slice'

const extractMessage = (err: unknown, fallback = 'Something went wrong') => {
    if (typeof err === 'string') return err
    if (err instanceof Error) return err.message || fallback

    // RTKQ / axios shaped errors
    const anyErr = err as any
    return anyErr?.data?.message || anyErr?.error?.data?.message || anyErr?.message || fallback
}

const refreshMeIntoProfile = async (dispatch: any) => {
    dispatch(setProfileStatus('loading'))
    const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
    const resolvedMe = resolveApiData<AppUser>(meResult)
    dispatch(setProfileUser(resolvedMe))
    dispatch(setProfileStatus('ready'))
    return resolvedMe
}

export const loadVerificationFileThunk = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
    'verify/loadCurrentFile',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(setVerifyError(null))
        dispatch(setVerifyStatus('loading'))

        try {
            const result = await dispatch(verificationFilesApi.endpoints.getCurrentVerificationFile.initiate(undefined, { forceRefetch: true }))
            const payload = resolveApiData(result) as GetCurrentVerificationFileResponse

            dispatch(setVerifyFile(payload.file))
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to load verification file')
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }
    }
)

export const uploadVerificationFileThunk = createAsyncThunk<
    void,
    { uri: string; name: string; type: string },
    { state: RootState; rejectValue: string }
>('verify/uploadFile', async ({ uri, name, type }, { dispatch, rejectWithValue }) => {
    dispatch(setVerifyError(null))
    dispatch(setVerifyStatus('submitting'))

    try {
        const result = await dispatch(verificationFilesApi.endpoints.uploadVerificationFile.initiate({ file: { uri, name, type } }))
        const payload = resolveApiData(result) as UploadVerificationFileResponse

        dispatch(setVerifyFile(payload.file))
        dispatch(setVerifyStatus('ready'))
    } catch (err) {
        const message = extractMessage(err, 'Failed to upload file')
        dispatch(setVerifyError(message))
        dispatch(setVerifyStatus('error'))
        return rejectWithValue(message)
    }
})

export const deleteVerificationFileThunk = createAsyncThunk<void, string, { state: RootState; rejectValue: string }>(
    'verify/deleteFile',
    async (fileId, { dispatch, rejectWithValue }) => {
        dispatch(setVerifyError(null))
        dispatch(setVerifyStatus('submitting'))

        try {
            const result = await dispatch(verificationFilesApi.endpoints.deleteVerificationFile.initiate(fileId))
            const payload = resolveApiData(result) as DeleteVerificationFileResponse
            // @ts-ignore
            dispatch(setVerifyFile(payload.file))
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to delete file')
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }
    }
)

export const submitVerificationThunk = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
    'verify/submitVerification',
    async (_, { dispatch, getState, rejectWithValue }) => {
        dispatch(setVerifyError(null))
        dispatch(setVerifyStatus('submitting'))

        const state = getState()
        const fileId = state.verify.file?.id

        if (!fileId) {
            const message = 'Please upload a document to submit for verification.'
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }

        try {
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_VERIFICATION_SUBMIT',
                    payload: { verificationFileId: fileId },
                })
            ).unwrap()

            await refreshMeIntoProfile(dispatch)
            await dispatch(loadVerificationFileThunk()).unwrap()

            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to submit verification')
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }
    }
)

export const skipVerificationThunk = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
    'verify/skipVerification',
    async (_, { dispatch, getState, rejectWithValue }) => {
        dispatch(setVerifyError(null))
        dispatch(setVerifyStatus('submitting'))

        const state = getState()
        const gate = state.profile.user?.verification

        if (gate && gate.requiresVerification === true && gate.graceExpired === true) {
            const message = 'Cannot skip verification: verification is required and grace period is expired or not provided'
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }

        try {
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_VERIFICATION_SKIP',
                    payload: null,
                })
            ).unwrap()

            await refreshMeIntoProfile(dispatch)

            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to skip verification')
            dispatch(setVerifyError(message))
            dispatch(setVerifyStatus('error'))
            return rejectWithValue(message)
        }
    }
)
