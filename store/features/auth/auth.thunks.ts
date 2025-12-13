import { createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'

import { AppDispatch, RootState } from '@/store/store'
import { login, logout as logoutService, signUp } from '@/services/auth/auth.service'
import { LoginPayload, SignUpPayload } from '@/services/auth/auth.types'
import { authApi } from '@/store/features/auth/authApi'
import { clearTokens, setTokens } from '@/services/auth/session'
import { firebaseAuth } from '@/services/auth/firebase/firebase.config'
import { getFirebaseLoginErrorMessage } from '@/services/auth'

import { clearProfile, setProfileStatus, setProfileUser } from '../profile/profile.slice'
import { logout, setAuthError, setAuthStatus } from './auth.slice'

const isUserNotSyncedError = (error: unknown) => {
    const status = (error as { status?: number; data?: { message?: string } } & { error?: { status?: number; data?: { message?: string } } })?.status
    const nestedStatus = (error as { error?: { status?: number } })?.error?.status
    const message =
        (error as { data?: { message?: string } })?.data?.message ?? (error as { error?: { data?: { message?: string } } })?.error?.data?.message
    return status === 404 || nestedStatus === 404 || message === 'User is not synced'
}

export const loginThunk = createAsyncThunk<void, LoginPayload, { dispatch: AppDispatch; state: RootState; rejectValue: string }>(
    'auth/login',
    async (payload, { dispatch, rejectWithValue }) => {
        dispatch(setAuthStatus('loading'))
        dispatch(setProfileStatus('loading'))

        try {
            await login(payload)

            dispatch(authApi.util.invalidateTags(['Me']))
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()

            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            dispatch(setAuthStatus('authenticated'))
        } catch (error) {
            const message = getFirebaseLoginErrorMessage(error)

            dispatch(setAuthStatus('unauthenticated'))
            dispatch(setProfileStatus('error'))
            dispatch(setAuthError(message))

            return rejectWithValue(message)
        }
    }
)

export const signUpThunk = createAsyncThunk<void, SignUpPayload, { dispatch: AppDispatch; state: RootState }>(
    'auth/signUp',
    async (payload, { dispatch, rejectWithValue }) => {
        dispatch(setAuthStatus('loading'))
        dispatch(setProfileStatus('loading'))
        try {
            await signUp(payload)
            const { username, avatar, role, phone } = payload
            const syncPayload = {
                ...(username ? { username } : {}),
                ...(phone ? { phone } : {}),
            }
            await dispatch(authApi.endpoints.authSync.initiate(syncPayload)).unwrap()
            dispatch(authApi.util.invalidateTags(['Me']))
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            dispatch(setAuthStatus('authenticated'))
            try {
                await dispatch(authApi.endpoints.sendVerificationEmail.initiate(undefined)).unwrap()
            } catch (verificationError) {
                // soft-fail, do not block sign-up
                if (__DEV__) {
                    console.warn('sendVerificationEmail failed', verificationError)
                }
            }
        } catch (error) {
            dispatch(setAuthStatus('unauthenticated'))
            dispatch(setProfileStatus('error'))
            dispatch(setAuthError(isAxiosError(error) ? error.message : 'Sign up failed'))
            return rejectWithValue(error)
        }
    }
)

export const logoutThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>('auth/logout', async (_, { dispatch }) => {
    await logoutService()
    await clearTokens()
    dispatch(logout())
    dispatch(clearProfile())
})

export const refreshEmailVerificationStatusThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'auth/refreshEmailVerificationStatus',
    async (_, { dispatch, rejectWithValue }) => {
        const currentUser = firebaseAuth.currentUser
        if (!currentUser) {
            return rejectWithValue('NO_USER')
        }
        try {
            const idToken = await currentUser.getIdToken(true)
            await setTokens({ accessToken: idToken, refreshToken: currentUser.refreshToken, tokenType: 'Bearer' })
            await dispatch(authApi.endpoints.authSync.initiate({})).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
            dispatch(setProfileUser(resolvedUser as never))
            if (!(resolvedUser as { emailVerified?: boolean }).emailVerified) {
                return rejectWithValue('NOT_VERIFIED')
            }
            dispatch(setAuthStatus('authenticated'))
        } catch (error) {
            dispatch(setProfileStatus('error'))
            return rejectWithValue(error)
        }
    }
)

export const bootstrapAuthThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
    'auth/bootstrap',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(setAuthStatus('loading'))
        dispatch(setProfileStatus('loading'))
        try {
            const currentUser = firebaseAuth.currentUser
            if (currentUser) {
                const idToken = await currentUser.getIdToken()
                await setTokens({ accessToken: idToken, refreshToken: currentUser.refreshToken, tokenType: 'Bearer' })
                try {
                    const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
                    const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
                    dispatch(setProfileUser(resolvedUser as never))
                    dispatch(setAuthStatus('authenticated'))
                    return
                } catch (error) {
                    if (isUserNotSyncedError(error)) {
                        try {
                            await dispatch(authApi.endpoints.authSync.initiate({})).unwrap()
                            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
                            const resolvedUser = (meResult as { data?: unknown })?.data ?? meResult
                            dispatch(setProfileUser(resolvedUser as never))
                            dispatch(setAuthStatus('authenticated'))
                            return
                        } catch (syncErr) {
                            throw syncErr
                        }
                    }
                    throw error
                }
            }
            dispatch(setAuthStatus('unauthenticated'))
            dispatch(clearProfile())
            dispatch(setProfileStatus('idle'))
        } catch (error) {
            dispatch(setAuthStatus('unauthenticated'))
            dispatch(clearProfile())
            dispatch(setProfileStatus('idle'))
            return rejectWithValue(error)
        }
    }
)
