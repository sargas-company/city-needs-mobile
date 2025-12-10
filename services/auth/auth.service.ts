import { AuthProvider } from './auth.provider'
import { AuthTokens, AuthUser, LoginPayload, SignUpPayload } from './auth.types'
import { clearTokens, getTokens, setTokens } from './session'
import { firebaseSignOut } from './firebase/logout'

let provider: AuthProvider | null = null

export const setAuthProvider = (authProvider: AuthProvider) => {
    provider = authProvider
}

const requireProvider = (): AuthProvider => {
    if (!provider) {
        throw new Error('Auth provider is not configured')
    }
    return provider
}

export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
    const tokens = await requireProvider().login(payload)
    await setTokens(tokens)
    return tokens
}

export const signUp = async (payload: SignUpPayload): Promise<AuthTokens> => {
    const authProvider = requireProvider()
    if (!authProvider.signUp) {
        throw new Error('Sign up is not supported by the configured provider')
    }
    const tokens = await authProvider.signUp(payload)
    await setTokens(tokens)
    return tokens
}

export const refresh = async (refreshToken: string): Promise<AuthTokens> => {
    const tokens = await requireProvider().refresh(refreshToken)
    await setTokens(tokens)
    return tokens
}

export const me = async (): Promise<AuthUser> => {
    const tokens = await getTokens()
    if (!tokens?.accessToken) {
        throw new Error('No access token available')
    }
    return requireProvider().me(tokens.accessToken)
}

export const logout = async (): Promise<void> => {
    const tokens = await getTokens()
    const refreshToken = tokens?.refreshToken
    const authProvider = requireProvider()
    if (authProvider.logout) {
        await authProvider.logout(refreshToken)
    } else {
        await firebaseSignOut()
    }
    await clearTokens()
}

export const getSession = () => getTokens()
