import { router } from 'expo-router'

import { AppDispatch } from '@/store'
import { api } from '@/store/api/api.slice'
import { clearUser, setAuthStatus } from '@/store/auth/auth.slice'

import { login as loginService, logout as logoutService } from './auth.service'
import { LoginPayload } from './auth.types'

export const performLogin = async (dispatch: AppDispatch, credentials: LoginPayload) => {
    dispatch(setAuthStatus('loading'))
    await loginService(credentials)
    dispatch(api.util.invalidateTags(['Me']))
    await dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true }))
    dispatch(setAuthStatus('authenticated'))
    router.replace('/(protected)/(tabs)')
}

export const performLogout = async (dispatch: AppDispatch) => {
    await logoutService()
    dispatch(clearUser())
    dispatch(setAuthStatus('unauthenticated'))
    router.replace('/(auth)/sign-in')
}
