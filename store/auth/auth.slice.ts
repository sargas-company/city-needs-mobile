import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { AuthUser } from '@/services/auth/auth.types'

import type { RootState } from '../index'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
    user: AuthUser | null
    isAuth: boolean
    status: AuthStatus
    error?: string
}

const initialState: AuthState = {
    user: null,
    isAuth: false,
    status: 'idle',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload
            state.isAuth = true
            state.status = 'authenticated'
            state.error = undefined
        },
        clearUser: (state) => {
            state.user = null
            state.isAuth = false
            state.status = 'unauthenticated'
            state.error = undefined
        },
        setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
            state.status = action.payload
            state.isAuth = action.payload === 'authenticated'
        },
        setAuthError: (state, action: PayloadAction<string | undefined>) => {
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.isAuth = false
            state.status = 'unauthenticated'
            state.error = undefined
        },
    },
})

export const { setUser, clearUser, setAuthStatus, setAuthError, logout } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthState = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuth = (state: RootState) => state.auth.isAuth
export const selectAuthStatus = (state: RootState) => state.auth.status
