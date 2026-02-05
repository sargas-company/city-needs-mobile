export type BusinessSort = 'price_asc' | 'price_desc' | 'nearby' | 'popular' | 'top_rated'

export type SearchBusinessesArgs = {
    cursor?: string | null
    limit?: number
    search?: string
    categoryId?: string
    city?: string
    priceMin?: number
    priceMax?: number
    sort?: BusinessSort
    lat?: number
    lng?: number
    withinKm?: 1 | 5
    openNow?: boolean
    bestPrice?: boolean
    topRated?: boolean
    availabilityDate?: string
    availabilityTime?: string
}

export type BusinessCategoryDto = {
    id: string
    title: string
    slug: string
}

export type BusinessCardDto = {
    id: string
    name: string
    logoUrl: string | null
    price: number
    city: string
    category: BusinessCategoryDto
    ratingAvg: number
    ratingCount: number
    serviceOnSite: boolean
    serviceInStudio: boolean
    distanceMeters?: number
    isSaved: boolean
}

export type BusinessesCursorMeta = {
    nextCursor: string | null
    hasNextPage: boolean
    totalCount: number | null
    totalPages: number | null
}

export type SearchBusinessesResponse = {
    code?: number
    data: BusinessCardDto[]
    meta: BusinessesCursorMeta
}
