export type VerificationLock = {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION'
    rejectionReason?: string | null
    reviewedAt?: string | null
}

export type VerificationFile = {
    id: string
    url?: string | null
    file?: unknown
    lock?: VerificationLock | null
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
    file?: unknown
}

export type SignedUrlResponse = {
    url: string
    expiresAt: string
}
