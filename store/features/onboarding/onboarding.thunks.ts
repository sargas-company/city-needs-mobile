import { createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch, RootState } from '@/store/store'
import { authApi } from '@/store/features/auth/authApi'
import { setProfileUser } from '@/store/features/profile/profile.slice'

import { onboardingApi, SubmitOnboardingRequest } from './onboardingApi'

export const submitOnboardingThunk = createAsyncThunk<void, SubmitOnboardingRequest, { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submit',
    async (body, { dispatch, rejectWithValue }) => {
        try {
            const resp = await dispatch(onboardingApi.endpoints.submitOnboarding.initiate(body)).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            dispatch(authApi.util.invalidateTags(['Me']))
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
