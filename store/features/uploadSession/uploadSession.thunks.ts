import { createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch, RootState } from '@/store/store'
import { uploadSessionsApi } from '@/store/api/uploadSessionsApi'
import { UploadItemKind } from '@/services/onboarding/uploadSession.types'

import { setUploadSession, setUploadSessionError, setUploadSessionStatus } from './uploadSession.slice'

type UploadFileArgs = {
    kind: UploadItemKind
    file: {
        uri: string
        name: string
        type: string
    }
}

export const bootstrapUploadSessionThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'uploadSession/bootstrap',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setUploadSessionStatus('loading'))
            const result = await dispatch(uploadSessionsApi.endpoints.getOrCreateDraft.initiate()).unwrap()
            dispatch(setUploadSession(result.session))
            dispatch(setUploadSessionStatus('ready'))
        } catch (error) {
            dispatch(setUploadSessionError('Failed to load upload session'))
            return rejectWithValue(error)
        }
    }
)

export const uploadSessionUploadFileThunk = createAsyncThunk<void, UploadFileArgs, { dispatch: AppDispatch; state: RootState }>(
    'uploadSession/uploadFile',
    async (args, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState()
            if (!state.uploadSession.session) {
                await dispatch(bootstrapUploadSessionThunk()).unwrap()
            }
            dispatch(setUploadSessionStatus('loading'))
            const result = await dispatch(uploadSessionsApi.endpoints.uploadFile.initiate(args)).unwrap()
            dispatch(setUploadSession(result.session))
            dispatch(setUploadSessionStatus('ready'))
        } catch (error) {
            dispatch(setUploadSessionError('Failed to upload file'))
            return rejectWithValue(error)
        }
    }
)

export const uploadSessionDeleteFileThunk = createAsyncThunk<void, string, { dispatch: AppDispatch; state: RootState }>(
    'uploadSession/deleteFile',
    async (fileId, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setUploadSessionStatus('loading'))
            const result = await dispatch(uploadSessionsApi.endpoints.deleteFile.initiate(fileId)).unwrap()
            dispatch(setUploadSession(result.session))
            dispatch(setUploadSessionStatus('ready'))
        } catch (error) {
            dispatch(setUploadSessionError('Failed to delete file'))
            return rejectWithValue(error)
        }
    }
)
