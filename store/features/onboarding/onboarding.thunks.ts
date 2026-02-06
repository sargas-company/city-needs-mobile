import { createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch, RootState } from '@/store/store'
import { authApi } from '@/store/features/auth/authApi'
import { setProfileError, setProfileStatus, setProfileUser } from '@/store/features/profile/profile.slice'
import { BusinessInfoFormValues } from '@/components/forms/businessInfoSchema'
import type { AppUser } from '@/store/features/profile/profile.types'
import { resolveApiData } from '@/store/features/auth/auth.thunks'

import { onboardingApi, SubmitOnboardingRequest } from './onboardingApi'

const normalizeDigits = (val: string) => val.replace(/\D/g, '')

export const submitOnboardingThunk = createAsyncThunk<void, SubmitOnboardingRequest, { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submit',
    async (body, { dispatch, rejectWithValue }) => {
        try {
            const resp = await dispatch(onboardingApi.endpoints.submitOnboarding.initiate(body)).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
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
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
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
            dispatch(setProfileStatus('loading'))
            const priceNumber = Number(values.price)
            const payload = {
                name: values.businessName.trim(),
                description: values.description.trim(),
                phone: normalizeDigits(values.phone),
                email: values.email.trim(),
                categoryId: values.categoryId,
                price: priceNumber,
                businessHours: values.businessHours
                    .filter((day) => day.isEnabled)
                    .map((day) => ({
                        weekday: day.weekday,
                        isClosed: false,
                        is24h: day.is24h ?? false,
                        startTime: (day.is24h ?? false) ? null : (day.startTime ?? null),
                        endTime: (day.is24h ?? false) ? null : (day.endTime ?? null),
                    })),
            }

            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_PROFILE',
                    payload,
                })
            ).unwrap()

            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            dispatch(authApi.util.invalidateTags(['Me']))
            dispatch(setProfileStatus('ready'))
        } catch (error) {
            dispatch(setProfileError('Failed to submit business profile'))
            return rejectWithValue(error)
        }
    }
)

export const submitBusinessFilesThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submitBusinessFiles',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setProfileStatus('loading'))
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_FILES',
                })
            ).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            dispatch(authApi.util.invalidateTags(['Me']))
            dispatch(setProfileStatus('ready'))
        } catch (error) {
            dispatch(setProfileError('Failed to upload branding files'))
            return rejectWithValue(error)
        }
    }
)

export const submitBusinessFilesSkipThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'onboarding/submitBusinessFilesSkip',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setProfileStatus('loading'))
            await dispatch(
                onboardingApi.endpoints.submitOnboarding.initiate({
                    action: 'BUSINESS_FILES_SKIP',
                })
            ).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            dispatch(authApi.util.invalidateTags(['Me']))
            dispatch(setProfileStatus('ready'))
        } catch (error) {
            dispatch(setProfileError('Failed to skip branding'))
            return rejectWithValue(error)
        }
    }
)
