import { createAsyncThunk } from '@reduxjs/toolkit'

import { verificationFilesApi } from '@/store/api/verificationFilesApi'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { AppDispatch, RootState } from '@/store'

import { setVerifyError, setVerifyFile, setVerifyStatus } from './verify.slice'

const extractMessage = (err: unknown, fallback: string) =>
    (err as { data?: { message?: string }; error?: { data?: { message?: string } } })?.data?.message ??
    (err as { error?: { data?: { message?: string } } })?.error?.data?.message ??
    (err instanceof Error ? err.message : fallback)

export const loadVerificationFileThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'verify/loadCurrent',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setVerifyStatus('loading'))
            const resp = await dispatch(verificationFilesApi.endpoints.getCurrentVerificationFile.initiate()).unwrap()
            dispatch(setVerifyFile(resp.file ?? null))
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to load verification file')
            dispatch(setVerifyError(message))
            return rejectWithValue(message)
        }
    }
)

export const uploadVerificationFileThunk = createAsyncThunk<
    void,
    { uri: string; name: string; type: string },
    { dispatch: AppDispatch; state: RootState }
>('verify/upload', async (file, { dispatch, rejectWithValue }) => {
    try {
        dispatch(setVerifyStatus('loading'))
        await dispatch(
            verificationFilesApi.endpoints.uploadVerificationFile.initiate({
                file,
            })
        ).unwrap()
        const resp = await dispatch(verificationFilesApi.endpoints.getCurrentVerificationFile.initiate()).unwrap()
        dispatch(setVerifyFile(resp.file ?? null))
        dispatch(setVerifyStatus('ready'))
    } catch (err) {
        const message = extractMessage(err, 'Failed to upload file')
        dispatch(setVerifyError(message))
        return rejectWithValue(message)
    }
})

export const deleteVerificationFileThunk = createAsyncThunk<void, string, { dispatch: AppDispatch; state: RootState }>(
    'verify/delete',
    async (fileId, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setVerifyStatus('loading'))
            await dispatch(verificationFilesApi.endpoints.deleteVerificationFile.initiate(fileId)).unwrap()
            const resp = await dispatch(verificationFilesApi.endpoints.getCurrentVerificationFile.initiate()).unwrap()
            dispatch(setVerifyFile(resp.file ?? null))
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to delete file')
            dispatch(setVerifyError(message))
            return rejectWithValue(message)
        }
    }
)

export const submitVerificationThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'verify/submit',
    async (_, { dispatch, getState, rejectWithValue }) => {
        const fileId = getState().verify.file?.id
        if (!fileId) {
            const message = 'Please upload a document to submit for verification.'
            dispatch(setVerifyError(message))
            return rejectWithValue(message)
        }
        try {
            dispatch(setVerifyStatus('submitting'))
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_VERIFICATION_SUBMIT',
                    payload: { verificationFileId: fileId },
                })
            ).unwrap()
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to submit verification')
            dispatch(setVerifyError(message))
            return rejectWithValue(message)
        }
    }
)

export const skipVerificationThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'verify/skip',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setVerifyStatus('submitting'))
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_VERIFICATION_SKIP',
                })
            ).unwrap()
            dispatch(setVerifyStatus('ready'))
        } catch (err) {
            const message = extractMessage(err, 'Failed to skip verification')
            dispatch(setVerifyError(message))
            return rejectWithValue(message)
        }
    }
)
