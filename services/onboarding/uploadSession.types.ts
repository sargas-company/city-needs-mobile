export type UploadItemKind = 'LOGO' | 'PHOTO' | 'DOCUMENT'

export type UploadSessionStatus = 'DRAFT' | 'COMMITTED' | 'ABORTED' | string

export type UploadSessionFileDto = {
    id: string
    url: string
    kind: UploadItemKind
    type: string
    storageKey: string | null
    originalName: string | null
    mimeType: string | null
    sizeBytes: number | null
}

export type UploadSessionDto = {
    id: string
    status: UploadSessionStatus
    logoCount: number
    photosCount: number
    documentsCount: number
    totalCount: number
    files: UploadSessionFileDto[]
}
