import type { AddressDto, BusinessHoursDto, CategoryPublicDto, FileDto } from '@/store/features/profile/profile.types'

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

    price?: number | null
    serviceOnSite?: boolean | null
    serviceInStudio?: boolean | null
    businessHours?: BusinessHoursDto[] | null

    averageRating?: number | null
    reviewCount?: number | null
}

export type PublicBusinessResponse = {
    code?: number
    data: PublicBusinessDto
    message?: string
}

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
