import axios from 'axios'

import { AuthProvider } from '../auth.provider'
import { AuthTokens, AuthUser, LoginPayload, SignUpPayload } from '../auth.types'

const client = axios.create({
    baseURL: 'https://dummyjson.com',
    headers: { 'Content-Type': 'application/json' },
})

const normalizeTokens = (data: { accessToken?: string; refreshToken?: string; expiresIn?: number }): AuthTokens => ({
    accessToken: data.accessToken ?? '',
    refreshToken: data.refreshToken ?? '',
    expiresIn: data.expiresIn,
    tokenType: 'Bearer',
})

export const dummyJsonAuthProvider: AuthProvider = {
    async login(payload: LoginPayload): Promise<AuthTokens> {
        const response = await client.post('/auth/login', payload)
        return normalizeTokens(response.data)
    },
    async refresh(refreshToken: string): Promise<AuthTokens> {
        const response = await client.post('/auth/refresh', { refreshToken })
        return normalizeTokens(response.data)
    },
    async me(accessToken: string): Promise<AuthUser> {
        const response = await client.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        return response.data as AuthUser
    },
    async signUp(_payload: SignUpPayload): Promise<AuthTokens> {
        throw new Error('Sign up is not supported with DummyJSON provider')
    },
    async logout(): Promise<void> {
        // DummyJSON has no logout endpoint; noop for now.
    },
}
