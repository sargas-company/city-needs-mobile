import { createAsyncThunk } from '@reduxjs/toolkit'

import { AppDispatch, RootState } from '@/store/store'
import { login, logout as logoutService, signUp } from '@/services/auth/auth.service'
import { LoginPayload, SignUpPayload } from '@/services/auth/auth.types'
import { authApi } from '@/store/features/auth/authApi'
import { clearTokens, setTokens } from '@/services/auth/session'
import { firebaseAuth, waitForAuthReady } from '@/services/auth/firebase/firebase.config'
import { firebaseSignOut } from '@/services/auth/firebase/logout'
import { getFirebaseLoginErrorMessage, getFirebaseSignUpErrorMessage } from '@/services/auth'
import { UserRole, type AppUser } from '@/store/features/profile/profile.types'

import { clearProfile, setProfileStatus, setProfileUser } from '../profile/profile.slice'
import { logout, setAuthError, setAuthStatus } from './auth.slice'

const isUserNotSyncedError = (error: unknown) => {
    const status = (error as { status?: number; data?: { message?: string } } & { error?: { status?: number; data?: { message?: string } } })?.status
    const nestedStatus = (error as { error?: { status?: number } })?.error?.status
    const message =
        (error as { data?: { message?: string } })?.data?.message ?? (error as { error?: { data?: { message?: string } } })?.error?.data?.message
    return status === 404 || nestedStatus === 404 || message === 'User is not synced'
}

export const resolveApiData = <T>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as any).data as T
    }
    return payload as T
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
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            dispatch(setAuthStatus('authenticated'))
        } catch (error) {
            // Clear tokens to prevent orphaned Firebase session
            await clearTokens()

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
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
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
            const message = getFirebaseSignUpErrorMessage(error)

            dispatch(setAuthStatus('unauthenticated'))
            dispatch(setProfileStatus('error'))
            dispatch(setAuthError(message))
            return rejectWithValue(message)
        }
    }
)

export const logoutThunk = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>('auth/logout', async (_, { dispatch }) => {
    await logoutService()
    await clearTokens()
    dispatch(logout())
    dispatch(clearProfile())
})

export const selectRoleThunk = createAsyncThunk<void, UserRole.END_USER | UserRole.BUSINESS_OWNER, { dispatch: AppDispatch; state: RootState }>(
    'auth/selectRole',
    async (role, { dispatch, rejectWithValue }) => {
        dispatch(setProfileStatus('loading'))
        try {
            await dispatch(authApi.endpoints.authSync.initiate({ role })).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            dispatch(authApi.util.invalidateTags(['Me']))
            dispatch(setProfileStatus('ready'))
        } catch (error) {
            dispatch(setProfileStatus('error'))
            return rejectWithValue(error)
        }
    }
)

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
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            if (!resolvedMe.user.emailVerified) {
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
        dispatch(setAuthError(undefined))
        dispatch(setProfileStatus('loading'))
        try {
            // Wait for Firebase to restore the session from AsyncStorage.
            // Reading firebaseAuth.currentUser directly is unreliable because
            // the restore is asynchronous and may not be complete yet.
            const currentUser = await waitForAuthReady()
            if (currentUser) {
                const idToken = await currentUser.getIdToken()
                await setTokens({ accessToken: idToken, refreshToken: currentUser.refreshToken, tokenType: 'Bearer' })
                try {
                    const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
                    const resolvedMe = resolveApiData<AppUser>(meResult)
                    dispatch(setProfileUser(resolvedMe))
                    dispatch(setAuthStatus('authenticated'))
                    return
                } catch (error) {
                    if (isUserNotSyncedError(error)) {
                        try {
                            await dispatch(authApi.endpoints.authSync.initiate({})).unwrap()
                            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
                            const resolvedMe = resolveApiData<AppUser>(meResult)
                            dispatch(setProfileUser(resolvedMe))
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
            // Sign out from Firebase to prevent desync between Firebase and backend
            await firebaseSignOut().catch(() => {})
            await clearTokens()

            dispatch(setAuthStatus('unauthenticated'))
            dispatch(clearProfile())
            dispatch(setProfileStatus('idle'))
            return rejectWithValue(error)
        }
    }
)
