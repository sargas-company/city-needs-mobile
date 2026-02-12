import { useCallback } from 'react'

import { AnalyticsActionType, AnalyticsEventType, AnalyticsSource, useCreateAnalyticsEventMutation } from '@/store/features/analytics'

type TrackProfileViewParams = {
    businessId: string
    source: AnalyticsSource
}

type TrackUserActionParams = {
    businessId: string
    source: AnalyticsSource
    actionType: AnalyticsActionType
}

export function useTrackAnalytics() {
    const [createEvent] = useCreateAnalyticsEventMutation()

    const trackProfileView = useCallback(
        ({ businessId, source }: TrackProfileViewParams) => {
            createEvent({
                businessId,
                type: AnalyticsEventType.PROFILE_VIEW,
                source,
            })
        },
        [createEvent]
    )

    const trackUserAction = useCallback(
        ({ businessId, source, actionType }: TrackUserActionParams) => {
            createEvent({
                businessId,
                type: AnalyticsEventType.USER_ACTION,
                source,
                actionType,
            })
        },
        [createEvent]
    )

    return {
        trackProfileView,
        trackUserAction,
    }
}

// Re-export enums for convenience
export { AnalyticsActionType, AnalyticsSource }
