import * as SecureStore from 'expo-secure-store'

import { AuthTokens } from '../api/types'

type TokenKey = 'accessToken' | 'refreshToken'

const TOKEN_KEYS: Record<TokenKey, string> = {
    accessToken: 'cityneeds_access_token',
    refreshToken: 'cityneeds_refresh_token',
}

let secureStoreAvailable: boolean | null = null
const memoryTokens: Partial<Record<TokenKey, string>> = {}

const ensureSecureStore = async () => {
    if (secureStoreAvailable !== null) {
        return secureStoreAvailable
    }

    secureStoreAvailable = await SecureStore.isAvailableAsync()
    return secureStoreAvailable
}

const readToken = async (key: TokenKey): Promise<string | null> => {
    const available = await ensureSecureStore()

    if (!available) {
        return memoryTokens[key] ?? null
    }

    return SecureStore.getItemAsync(TOKEN_KEYS[key])
}

const writeToken = async (key: TokenKey, value: string | null) => {
    const available = await ensureSecureStore()

    if (!available) {
        if (value) {
            memoryTokens[key] = value
        } else {
            delete memoryTokens[key]
        }
        return
    }

    if (value) {
        await SecureStore.setItemAsync(TOKEN_KEYS[key], value)
        return
    }

    await SecureStore.deleteItemAsync(TOKEN_KEYS[key])
}

export const getAccessToken = () => readToken('accessToken')

export const getRefreshToken = () => readToken('refreshToken')

export const persistTokens = async ({ accessToken, refreshToken }: AuthTokens) => {
    await Promise.all([writeToken('accessToken', accessToken), writeToken('refreshToken', refreshToken)])
}

export const clearSession = async () => {
    await Promise.all([writeToken('accessToken', null), writeToken('refreshToken', null)])
}

export const getSessionTokens = async (): Promise<AuthTokens | null> => {
    const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()])

    if (!accessToken || !refreshToken) {
        return null
    }

    return { accessToken, refreshToken }
}
