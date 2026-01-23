export type SavedBusinessCard = {
    id: string
    name: string
    city: string
    logoUrl: string | null
}

export type CursorPaginationMeta = {
    nextCursor: string | null
    totalCount: number
    totalPages: number
    hasNextPage: boolean
}

export type SavedBusinessesListResponse = {
    code: number
    data: SavedBusinessCard[]
    meta: CursorPaginationMeta
}

export type SavedBusinessesActionResponse = {
    code: number
    data: null
    message?: string
}
