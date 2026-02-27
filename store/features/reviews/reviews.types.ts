export type CreateReviewDto = {
    bookingId: string
    businessId: string
    rating: number
    comment?: string
}

export type ReviewResponseDto = {
    id: string
    rating: number
    comment?: string | null
    createdAt: string
    updatedAt: string
}

export type CreateReviewResponse = {
    code?: number
    data: ReviewResponseDto
    message?: string
}

export type ReviewListItemDto = {
    id: string
    rating: number
    comment?: string | null
    createdAt: string
    authorName: string
}

export type ReviewListMeta = {
    nextCursor: string | null
    totalCount: number
    totalPages: number
    hasNextPage: boolean
}

export type ReviewListResponse = {
    code?: number
    data: ReviewListItemDto[]
    meta: ReviewListMeta
}

export type GetBusinessReviewsArgs = {
    businessId: string
    cursor?: string | null
    limit?: number
}
