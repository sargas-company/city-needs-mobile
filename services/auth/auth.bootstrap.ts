import { onIdTokenChanged } from 'firebase/auth'

import { AppDispatch } from '@/store/store'
import { authApi } from '@/store/features/auth/authApi'
import { clearUser, setAuthStatus } from '@/store/features/auth/auth.slice'
import { clearProfile, setProfileStatus, setProfileUser } from '@/store/features/profile/profile.slice'

import { firebaseAuth } from './firebase/firebase.config'
import { setTokens, clearTokens } from './session'

let authSyncInProgress = false
export const setAuthSyncInProgress = (value: boolean) => {
    authSyncInProgress = value
}

const isUserNotSyncedError = (error: unknown) => {
    const status = (error as { error?: { status?: number; data?: { message?: string } } })?.error?.status
    const message = (error as { error?: { data?: { message?: string } } })?.error?.data?.message
    return status === 404 || message === 'User is not synced'
}

export const bootstrapAuth = async (dispatch: AppDispatch) => {
    dispatch(setAuthStatus('loading'))
    dispatch(setProfileStatus('loading'))

    try {
        const currentUser = firebaseAuth.currentUser
        if (currentUser) {
            const idToken = await currentUser.getIdToken()
            await setTokens({ accessToken: idToken, refreshToken: currentUser.refreshToken, tokenType: 'Bearer' })
            dispatch(setProfileStatus('loading'))
            if (!authSyncInProgress) {
                const mePromise = dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false }))
                try {
                    const meResult = await mePromise.unwrap()
                    dispatch(setProfileUser(meResult))
                    dispatch(setAuthStatus('authenticated'))
                } catch (error) {
                    if (isUserNotSyncedError(error)) {
                        try {
                            // @ts-ignore
                            await dispatch(authApi.endpoints.authSync.initiate({}, { forceRefetch: true, subscribe: false })).unwrap()
                            const syncedMe = await dispatch(
                                authApi.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false })
                            ).unwrap()
                            dispatch(setProfileUser(syncedMe))
                            dispatch(setAuthStatus('authenticated'))
                        } catch (syncError) {
                            throw syncError
                        }
                    } else {
                        throw error
                    }
                }
            }
        } else {
            dispatch(setAuthStatus('unauthenticated'))
            dispatch(clearProfile())
            dispatch(setProfileStatus('idle'))
        }

        onIdTokenChanged(firebaseAuth, async (user) => {
            if (user) {
                const idToken = await user.getIdToken()
                await setTokens({ accessToken: idToken, refreshToken: user.refreshToken, tokenType: 'Bearer' })
                dispatch(setProfileStatus('loading'))
                if (!authSyncInProgress) {
                    const mePromise = dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false }))
                    try {
                        const meResult = await mePromise.unwrap()
                        dispatch(setProfileUser(meResult))
                        dispatch(setAuthStatus('authenticated'))
                    } catch (error) {
                        if (isUserNotSyncedError(error)) {
                            try {
                                // @ts-ignore
                                await dispatch(authApi.endpoints.authSync.initiate({}, { forceRefetch: true, subscribe: false })).unwrap()
                                const syncedMe = await dispatch(
                                    authApi.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false })
                                ).unwrap()
                                dispatch(setProfileUser(syncedMe))
                                dispatch(setAuthStatus('authenticated'))
                            } catch (syncError) {
                                throw syncError
                            }
                        } else {
                            throw error
                        }
                    }
                }
            } else {
                await clearTokens()
                dispatch(clearUser())
                dispatch(clearProfile())
                dispatch(setProfileStatus('idle'))
                dispatch(setAuthStatus('unauthenticated'))
            }
        })
    } catch {
        await clearTokens()
        dispatch(clearUser())
        dispatch(clearProfile())
        dispatch(setProfileStatus('idle'))
        dispatch(setAuthStatus('unauthenticated'))
    }
}
