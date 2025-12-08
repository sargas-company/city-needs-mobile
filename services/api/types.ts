export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface ApiErrorPayload {
    message: string
    code?: string
    status?: number
    data?: unknown
}
