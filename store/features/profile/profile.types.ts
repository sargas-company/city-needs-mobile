export enum UserRole {
    END_USER = 'END_USER',
    BUSINESS_OWNER = 'BUSINESS_OWNER',
}
export type UserStatus = string
export type BusinessStatus = string
export type FileType = string

export type BusinessHoursDto = {
    weekday: number
    isClosed?: boolean
    is24h?: boolean
    startTime?: string | null
    endTime?: string | null
}

export type UserDto = {
    id: string

    email?: string | null
    phone?: string | null
    username?: string | null
    avatar?: string | null

    role?: UserRole | null
    status: UserStatus

    emailVerified: boolean
    lastVerificationEmailSentAt?: string | null

    onboardingStep?: number | null

    createdAt: string
    updatedAt: string
}

export type CategoryPublicDto = {
    id: string
    title: string
    slug: string
    description?: string | null
}

export type AddressDto = {
    id: string
    countryCode: string
    city: string
    state: string
    addressLine1: string
    addressLine2?: string | null
    zip?: string | null
}

export type FileDto = {
    id: string
    url: string
    type: FileType
    mimeType?: string | null
    sizeBytes?: number | null
    originalName?: string | null
}

export enum VideoProcessingStatus {
    UPLOADED = 'UPLOADED',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    FAILED = 'FAILED',
}

export enum BusinessVideoVerificationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RESUBMISSION = 'RESUBMISSION',
}

export type BusinessVideoDto = {
    id: string
    processingStatus: VideoProcessingStatus
    processedUrl: string | null
    thumbnailUrl: string | null
    durationSeconds: number | null
    width: number | null
    height: number | null
    status: BusinessVideoVerificationStatus
}

export type BusinessDto = {
    id: string
    name: string
    description: string
    phone: string
    email: string

    status: BusinessStatus

    categoryId: string
    category?: CategoryPublicDto | null

    addressId?: string | null
    address?: AddressDto | null

    logoId?: string | null
    logo?: FileDto | null

    video?: BusinessVideoDto | null

    price?: number | null
    serviceOnSite?: boolean | null
    serviceInStudio?: boolean | null
    businessHours?: BusinessHoursDto[] | null

    verificationGraceDeadlineAt?: string | null
}

export type BusinessVerificationNextAction = 'NONE' | 'GO_TO_VERIFICATION'

export type BusinessVerificationGateDto = {
    requiresVerification: boolean
    graceDeadlineAt?: string | null
    graceExpired: boolean
    status: BusinessStatus
    canUseApp: boolean
    nextAction: BusinessVerificationNextAction
}

export type MeLocationDto = {
    lat: number
    lng: number
    source: string
    provider?: string | null
    placeId?: string | null
    formattedAddress?: string | null
    updatedAt: string
}

export type AppUser = {
    user: UserDto
    business?: BusinessDto | null
    verification?: BusinessVerificationGateDto | null
    location?: MeLocationDto | null
}
