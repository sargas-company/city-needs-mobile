export type ApiBookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export type BookingServiceItemDto = {
    id: string
    name: string
    price: number
    duration: number
}

export type BookingListItemDto = {
    id: string
    businessId: string
    businessName?: string
    businessPhone?: string | null
    businessLogo?: {
        id: string
        url: string
    }
    status: ApiBookingStatus
    startAt: string
    endAt: string
    createdAt: string
    hasReview?: boolean
    services: BookingServiceItemDto[]
    totalPrice: number
}

export type BookingResponseDto = {
    id: string
    businessId: string
    userId: string
    status: ApiBookingStatus
    startAt: string
    endAt: string
    totalDurationMinutes: number
    serviceIds: string[]
    createdAt: string
}

export type CursorPaginationMeta = {
    nextCursor: string | null
    totalCount: number
    totalPages: number
    hasNextPage: boolean
}

export type BookingListResponse = {
    code?: number
    data: BookingListItemDto[]
    meta: CursorPaginationMeta
}

export type BookingResponse = {
    code?: number
    data: BookingResponseDto
    message?: string
}

export type CreateBookingDto = {
    businessId: string
    serviceIds: string[]
    startAt: string
}

export type CancelBookingDto = {
    reason?: string
}

export type UpdateBookingStatusDto = {
    status: 'CONFIRMED' | 'COMPLETED'
}

export type GetMyBookingsArgs = {
    cursor?: string | null
    limit?: number
    withoutReview?: boolean
}

export type BusinessBookingListItemDto = {
    id: string
    userId: string
    userName?: string
    userPhone?: string
    userAvatar?: {
        id: string
        url: string
    } | null
    status: ApiBookingStatus
    startAt: string
    endAt: string
    createdAt: string
    services: BookingServiceItemDto[]
    totalPrice: number
}

export type BusinessBookingListResponse = {
    code?: number
    data: BusinessBookingListItemDto[]
    meta: CursorPaginationMeta
}

export type GetBusinessBookingsArgs = {
    cursor?: string | null
    limit?: number
    status?: ApiBookingStatus
    date?: string
}
