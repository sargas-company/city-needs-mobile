import { onIdTokenChanged } from 'firebase/auth'

import { AppDispatch } from '@/store'
import { api } from '@/store/api/api.slice'
import { clearUser, setAuthStatus } from '@/store/auth/auth.slice'
import { clearProfile, setProfileStatus } from '@/store/profile/profile.slice'

import { firebaseAuth } from './firebase/firebase.config'
import { setTokens, clearTokens } from './session'

export const bootstrapAuth = async (dispatch: AppDispatch) => {
    dispatch(setAuthStatus('loading'))
    dispatch(setProfileStatus('loading'))

    try {
        const currentUser = firebaseAuth.currentUser
        if (currentUser) {
            const idToken = await currentUser.getIdToken()
            await setTokens({ accessToken: idToken, refreshToken: currentUser.refreshToken, tokenType: 'Bearer' })
            dispatch(setProfileStatus('loading'))
            dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false }))
            dispatch(setAuthStatus('authenticated'))
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
                dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false }))
                dispatch(setAuthStatus('authenticated'))
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
