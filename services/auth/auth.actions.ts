import { router } from 'expo-router'

import { AppDispatch } from '@/store'
import { api } from '@/store/api/api.slice'
import { setAuthStatus, logout as logoutAction } from '@/store/auth/auth.slice'
import { clearProfile, setProfileStatus } from '@/store/profile/profile.slice'

import { login as loginService, logout as logoutService, signUp as signUpService } from './auth.service'
import { LoginPayload, SignUpPayload } from './auth.types'
import { setAuthSyncInProgress } from './auth.bootstrap'

export const performLogin = async (dispatch: AppDispatch, credentials: LoginPayload) => {
    dispatch(setAuthStatus('loading'))
    dispatch(setProfileStatus('loading'))
    try {
        await loginService(credentials)
        dispatch(api.util.invalidateTags(['Me']))
        await dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
        dispatch(setAuthStatus('authenticated'))
        router.replace('/(protected)/(tabs)')
    } catch (error) {
        dispatch(setAuthStatus('unauthenticated'))
        dispatch(setProfileStatus('error'))
        throw error
    }
}

export const performLogout = async (dispatch: AppDispatch) => {
    await logoutService()
    dispatch(logoutAction())
    dispatch(clearProfile())
    router.replace('/(auth)/sign-in')
}

export const performSignUp = async (dispatch: AppDispatch, payload: SignUpPayload) => {
    dispatch(setAuthStatus('loading'))
    dispatch(setProfileStatus('loading'))
    setAuthSyncInProgress(true)
    try {
        await signUpService(payload)
        await dispatch(api.endpoints.authSync.initiate(payload, { forceRefetch: true })).unwrap()
        dispatch(api.util.invalidateTags(['Me']))
        await dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
        dispatch(setAuthStatus('authenticated'))
        router.replace('/(protected)/(tabs)')
    } catch (error) {
        dispatch(setAuthStatus('unauthenticated'))
        dispatch(setProfileStatus('error'))
        throw error
    } finally {
        setAuthSyncInProgress(false)
    }
}
