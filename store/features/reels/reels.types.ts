export type ReelVideo = {
    url: string
}

export type MyReel = {
    id: string
    businessId: string
    video: ReelVideo
    createdAt: string
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
