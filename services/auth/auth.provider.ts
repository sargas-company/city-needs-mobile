import { AuthTokens, AuthUser, LoginPayload, SignUpPayload } from './auth.types'

export interface AuthProvider {
    login(payload: LoginPayload): Promise<AuthTokens>
    signUp?(payload: SignUpPayload): Promise<AuthTokens>
    refresh(refreshToken: string): Promise<AuthTokens>
    me(accessToken: string): Promise<AuthUser>
    logout?(refreshToken?: string): Promise<void>
}
