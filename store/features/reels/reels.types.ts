export type ReelProcessingStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'

export type ReelVideo = {
    id: string
    url: string
    storageKey: string
    type: string
    mimeType: string
    sizeBytes: number
    originalName: string
    businessId: string
    createdAt: string
    updatedAt: string
}

export type MyReel = {
    id: string
    businessId: string
    videoFileId: string
    processingStatus: ReelProcessingStatus
    processedUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    width: number | null
    height: number | null
    processingStartedAt: string | null
    processingFinishedAt: string | null
    lastError: string | null
    retryCount: number
    createdAt: string
    updatedAt: string
    video: ReelVideo
}

export type GetMyReelResponse = {
    code?: number
    reel: MyReel | null
}

export type UpsertMyReelArgs = {
    uri: string
    name: string
    type: string
}

export type UpsertMyReelResponse = {
    code?: number
    reel: MyReel
}

export type DeleteMyReelArgs = {
    reelId: string
}

export type DeleteMyReelResponse = {
    code?: number
    deleted: true
}

export type ReelFeedBusinessAddress = {
    countryCode: string
    city: string
    state: string
    addressLine1: string
    addressLine2: string | null
    zip: string
}

export type ReelFeedBusiness = {
    id: string
    name: string
    categoryId: string
    ratingAvg: number
    ratingCount: number
    logoUrl: string | null
    address: ReelFeedBusinessAddress
}

export type ReelFeedItem = {
    id: string
    videoUrl: string
    thumbnailUrl: string
    createdAt: string
    business: ReelFeedBusiness
}

export type GetReelsFeedResponse = {
    code?: number
    items: ReelFeedItem[]
    nextCursor: string | null
    hasNextPage: boolean
}

export type GetReelsFeedArgs = {
    cursor?: string
    limit?: number
    search?: string
    categoryId?: string
}
