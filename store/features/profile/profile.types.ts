export type AppUser = {
    id: string
    firebaseUid: string
    email?: string
    name?: string
    phone?: string
    role?: 'END_USER' | 'BUSINESS_OWNER' | null
    emailVerified?: boolean
    onboardingStep?: number | null
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    zip?: string
    countryCode?: string
    countryName?: string
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}
