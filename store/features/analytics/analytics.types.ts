// Enums matching Prisma schema
export enum AnalyticsEventType {
    PROFILE_VIEW = 'PROFILE_VIEW',
    USER_ACTION = 'USER_ACTION',
}

export enum AnalyticsSource {
    SEARCH = 'SEARCH',
    MAP = 'MAP',
    REELS = 'REELS',
    DIRECT = 'DIRECT',
}

export enum AnalyticsActionType {
    CALL = 'CALL',
    WHATSAPP = 'WHATSAPP',
    WEBSITE = 'WEBSITE',
    DIRECTIONS = 'DIRECTIONS',
    SHARE = 'SHARE',
    SAVE = 'SAVE',
}

// Request DTOs
export type CreateAnalyticsEventDto = {
    businessId: string
    type: AnalyticsEventType
    source: AnalyticsSource
    actionType?: AnalyticsActionType
}

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

export type AnalyticsSummaryResponse = ApiResponse<AnalyticsSummary>

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
