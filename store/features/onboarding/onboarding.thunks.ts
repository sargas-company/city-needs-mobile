import { createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch, RootState } from '@/store/store'
import { authApi } from '@/store/features/auth/authApi'
import { setProfileUser } from '@/store/features/profile/profile.slice'
import { BusinessInfoFormValues } from '@/components/forms/businessInfoSchema'

import { onboardingApi, SubmitOnboardingRequest } from './onboardingApi'

const normalizeDigits = (val: string) => val.replace(/\D/g, '')

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

export const submitCustomerCategoriesThunk = createAsyncThunk<void, string[], { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submitCustomerCategories',
    async (categoryIds, { dispatch, rejectWithValue }) => {
        try {
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'CUSTOMER_CATEGORIES',
                    payload: { categoryIds },
                })
            ).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            dispatch(authApi.util.invalidateTags(['Me']))
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

export const submitBusinessProfileThunk = createAsyncThunk<void, BusinessInfoFormValues, { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submitBusinessProfile',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const payload = {
                name: values.businessName.trim(),
                description: `${values.description.trim()}\n\nOperating hours: ${values.operatingHours.trim()}`,
                phone: normalizeDigits(values.phone),
                email: values.email.trim(),
                categoryIds: values.categoryIds,
            }

            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_PROFILE',
                    payload,
                })
            ).unwrap()

            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            dispatch(authApi.util.invalidateTags(['Me']))
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
