export type VerificationFile = {
    id: string
    url?: string | null
    file?: unknown
    lock?: unknown
    status?: string | null
    originalName?: string | null
    mimeType?: string | null
    sizeBytes?: number | null
}

export type GetCurrentVerificationFileResponse = {
    file: VerificationFile | null
}

export type UploadVerificationFileResponse = {
    file: VerificationFile
}

export type DeleteVerificationFileResponse = {
    deleted: true
}

export type SignedUrlResponse = {
    url: string
    expiresAt: string
}
