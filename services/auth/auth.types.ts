export type AuthTokens = {
    accessToken: string
    refreshToken: string
    expiresIn?: number
    tokenType?: 'Bearer'
}

export type LoginPayload = {
    username?: string
    email?: string
    password: string
}

export type UserRole = 'END_USER' | 'BUSINESS_OWNER'

export type SignUpPayload = {
    username?: string
    fullName?: string
    email?: string
    password: string
    avatar?: string
    role?: UserRole
    phone?: string
}

export type AuthUser = {
    id: number | string
    username: string
    email?: string
    firstName?: string
    lastName?: string
    image?: string
    [key: string]: unknown
}
