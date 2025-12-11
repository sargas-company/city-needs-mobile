import { AuthUser } from '@/services/auth/auth.types'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export type AuthState = {
    user: AuthUser | null
    isAuth: boolean
    status: AuthStatus
    error?: string
}
