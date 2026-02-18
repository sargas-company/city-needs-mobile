import type { AddressDto, BusinessHoursDto, CategoryPublicDto, FileDto } from '@/store/features/profile/profile.types'

export type BusinessPublicVideoDto = {
    id: string
    processedUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    width: number | null
    height: number | null
    createdAt: string
    updatedAt: string
}

export type PublicBusinessDto = {
    id: string
    name: string
    description: string
    phone: string
    email: string

    categoryId: string
    category?: CategoryPublicDto | null

    address?: AddressDto | null
    logo?: FileDto | null
    photos?: FileDto[]
    video?: BusinessPublicVideoDto | null

    price?: number | null
    serviceOnSite?: boolean | null
    serviceInStudio?: boolean | null
    businessHours?: BusinessHoursDto[] | null

    ratingAvg?: number | null
    ratingCount?: number | null
}

export type PublicBusinessResponse = {
    code?: number
} & PublicBusinessDto

export type PublicServiceDto = {
    id: string
    name: string
    price: number
    duration: number
    position: number
    status: 'ACTIVE' | 'INACTIVE'
}

export type PublicServicesListResponse = {
    code?: number
    data: PublicServiceDto[]
}

export type AvailabilitySlot = {
    startAt: string
    endAt: string
}

export type AvailabilityData = {
    businessId: string
    date: string
    timeZone: string
    slotStepMinutes: number
    bufferMinutes: number
    totalDurationMinutes: number
    slots: AvailabilitySlot[]
}

export type GetAvailabilityArgs = {
    businessId: string
    date: string
    serviceIds: string[]
}

export type AvailabilityResponse = AvailabilityData

export type BusinessHourItemDto = {
    id: string
    businessId: string
    weekday: number
    startTime: string | null
    endTime: string | null
    isClosed: boolean
    is24h: boolean
}

export type BusinessHoursDayDto = {
    weekday: number
    hours: BusinessHourItemDto[]
}
