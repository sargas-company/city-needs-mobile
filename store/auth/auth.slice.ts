import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { AuthUser } from '@/services/auth/auth.types'

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
    },
})

export const { setUser, clearUser, setAuthStatus, setAuthError } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthState = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuth = (state: { auth: AuthState }) => state.auth.isAuth
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
