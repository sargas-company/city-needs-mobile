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
    success: true
    data: { reel: MyReel | null }
}

export type UpsertMyReelArgs = {
    uri: string
    name: string
    type: string
}

export type UpsertMyReelResponse = {
    success: true
    data: { reel: MyReel }
}

export type DeleteMyReelResponse = {
    success: true
    data: { deleted: true }
}

export type ReelFeedBusiness = {
    id: string
    name: string
    categoryId: string
    logoUrl: string | null
}

export type ReelFeedItem = {
    id: string
    videoUrl: string
    createdAt: string
    business: ReelFeedBusiness
}

export type GetReelsFeedData = {
    items: ReelFeedItem[]
    nextCursor: string | null
    hasNextPage: boolean
}

export type GetReelsFeedResponse = {
    success: true
    data: GetReelsFeedData
}

export type GetReelsFeedArgs = {
    cursor?: string
    limit?: number
    search?: string
    categoryId?: string
}
