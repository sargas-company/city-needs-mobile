export type CreateReviewDto = {
    bookingId: string
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
