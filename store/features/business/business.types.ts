import type { BusinessDto, BusinessHoursDto } from '@/store/features/profile/profile.types'

export type UpdateBusinessProfileDto = {
    name?: string
    phone?: string
    description?: string
    serviceOnSite?: boolean
    serviceInStudio?: boolean
    price?: number
    businessHours?: BusinessHoursDto[]
}

export type UpdateBusinessProfileResponse = {
    code?: number
    data: BusinessDto
    message?: string
}

export type UpdateBusinessLogoArgs = {
    uri: string
    name: string
    type: string
}

export type UpdateBusinessLogoResponse = {
    code?: number
    data: { id: string; url: string }
    message?: string
}
