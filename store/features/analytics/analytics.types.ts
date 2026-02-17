// Enums matching Prisma schema
export enum AnalyticsEventType {
    PROFILE_VIEW = 'PROFILE_VIEW',
    USER_ACTION = 'USER_ACTION',
}

export enum AnalyticsSource {
    SEARCH = 'SEARCH',
    CATEGORIES = 'CATEGORIES',
    REELS = 'REELS',
}

export enum AnalyticsActionType {
    CALL = 'CALL',
    MESSAGE = 'MESSAGE',
    BOOKING = 'BOOKING',
}

// Request DTOs
export type CreateProfileViewEventDto = {
    businessId: string
    type: AnalyticsEventType.PROFILE_VIEW
    source: AnalyticsSource
}

export type CreateUserActionEventDto = {
    businessId: string
    type: AnalyticsEventType.USER_ACTION
    actionType: AnalyticsActionType
}

export type CreateAnalyticsEventDto = CreateProfileViewEventDto | CreateUserActionEventDto

// Response types
export type ApiResponse<T> = {
    code?: number
    data: T
    message?: string
}

// Summary
export type MetricDto = {
    total: number
    deltaPercent: number
}

export type AnalyticsSummary = {
    profileViews: MetricDto
    userActions: MetricDto
}

export type AnalyticsSummaryResponse = {
    code?: number
    profileViews: MetricDto
    userActions: MetricDto
}

// Activity
export type ActivityMonthDto = {
    label: string
    views: number
    actions: number
}

export type AnalyticsActivity = {
    data: ActivityMonthDto[]
}

export type AnalyticsActivityResponse = ApiResponse<ActivityMonthDto[]>

// Profile Views
export type TimelineItemDto = {
    label: string
    value: number
}

export type SourceDistributionDto = {
    source: AnalyticsSource
    percent: number
}

export type AnalyticsProfileViews = {
    total: number
    deltaPercent: number
    timeline: TimelineItemDto[]
    sources: SourceDistributionDto[]
}

export type AnalyticsProfileViewsResponse = ApiResponse<AnalyticsProfileViews>

// User Actions
export type InteractionDistributionDto = {
    type: AnalyticsActionType
    percent: number
}

export type AnalyticsUserActions = {
    total: number
    deltaPercent: number
    timeline: TimelineItemDto[]
    interactions: InteractionDistributionDto[]
}

export type AnalyticsUserActionsResponse = ApiResponse<AnalyticsUserActions>

// Create event response
export type CreateAnalyticsEventResponse = ApiResponse<{ success: boolean }>
