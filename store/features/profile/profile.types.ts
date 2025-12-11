export type AppUser = {
    id: string
    firebaseUid: string
    email?: string
    name?: string
    emailVerified?: boolean
    onboardingStep?: number | null
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}
