import { useCallback } from 'react'

import { AnalyticsActionType, AnalyticsEventType, AnalyticsSource, useCreateAnalyticsEventMutation } from '@/store/features/analytics'

type TrackProfileViewParams = {
    businessId: string
    source: AnalyticsSource
}

type TrackUserActionParams = {
    businessId: string
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
        ({ businessId, actionType }: TrackUserActionParams) => {
            createEvent({
                businessId,
                type: AnalyticsEventType.USER_ACTION,
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
