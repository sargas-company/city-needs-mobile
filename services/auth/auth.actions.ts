import { router } from 'expo-router'

import { AppDispatch } from '@/store'
import { api } from '@/store/api/api.slice'
import { setAuthStatus, logout as logoutAction } from '@/store/auth/auth.slice'

import { login as loginService, logout as logoutService, signUp as signUpService } from './auth.service'
import { LoginPayload, SignUpPayload } from './auth.types'

export const performLogin = async (dispatch: AppDispatch, credentials: LoginPayload) => {
    dispatch(setAuthStatus('loading'))
    try {
        await loginService(credentials)
        dispatch(api.util.invalidateTags(['Me']))
        await dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true }))
        dispatch(setAuthStatus('authenticated'))
        router.replace('/(protected)/(tabs)')
    } catch (error) {
        dispatch(setAuthStatus('unauthenticated'))
        throw error
    }
}

export const performLogout = async (dispatch: AppDispatch) => {
    await logoutService()
    dispatch(logoutAction())
    router.replace('/(auth)/sign-in')
}

export const performSignUp = async (dispatch: AppDispatch, payload: SignUpPayload) => {
    dispatch(setAuthStatus('loading'))
    try {
        await signUpService(payload)
        dispatch(api.util.invalidateTags(['Me']))
        await dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true }))
        dispatch(setAuthStatus('authenticated'))
        router.replace('/(protected)/(tabs)')
    } catch (error) {
        dispatch(setAuthStatus('unauthenticated'))
        throw error
    }
}
