export type AppUser = {
    id: string
    firebaseUid: string
    email?: string
    name?: string
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}
