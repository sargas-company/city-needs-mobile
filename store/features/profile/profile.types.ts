export type AppUser = {
    id: string
    firebaseUid: string
    email?: string
    name?: string
    emailVerified?: boolean
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}
