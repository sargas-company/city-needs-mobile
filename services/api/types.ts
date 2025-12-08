export interface ApiErrorPayload {
    message: string
    code?: string
    status?: number
    data?: unknown
}

export interface ApiAuthRequestConfig {
    _retry?: boolean
}
