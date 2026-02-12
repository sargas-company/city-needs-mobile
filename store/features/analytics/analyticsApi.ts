import { baseApi } from '@/store/api/baseApi'

import type {
    AnalyticsActivityResponse,
    AnalyticsProfileViewsResponse,
    AnalyticsSummaryResponse,
    AnalyticsUserActionsResponse,
    CreateAnalyticsEventDto,
    CreateAnalyticsEventResponse,
} from './analytics.types'

export const analyticsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Mutation for END_USER to track events
        createAnalyticsEvent: builder.mutation<CreateAnalyticsEventResponse, CreateAnalyticsEventDto>({
            query: (data) => ({
                url: '/analytics/event',
                method: 'POST',
                data,
            }),
        }),

        // Queries for BUSINESS_OWNER analytics dashboard
        getAnalyticsSummary: builder.query<AnalyticsSummaryResponse, void>({
            query: () => ({
                url: '/analytics/summary',
                method: 'GET',
            }),
            providesTags: [{ type: 'Analytics', id: 'SUMMARY' }],
        }),

        getAnalyticsActivity: builder.query<AnalyticsActivityResponse, void>({
            query: () => ({
                url: '/analytics/activity',
                method: 'GET',
            }),
            providesTags: [{ type: 'Analytics', id: 'ACTIVITY' }],
        }),

        getAnalyticsProfileViews: builder.query<AnalyticsProfileViewsResponse, void>({
            query: () => ({
                url: '/analytics/profile-views',
                method: 'GET',
            }),
            providesTags: [{ type: 'Analytics', id: 'PROFILE_VIEWS' }],
        }),

        getAnalyticsUserActions: builder.query<AnalyticsUserActionsResponse, void>({
            query: () => ({
                url: '/analytics/user-actions',
                method: 'GET',
            }),
            providesTags: [{ type: 'Analytics', id: 'USER_ACTIONS' }],
        }),
    }),
})

export const {
    useCreateAnalyticsEventMutation,
    useGetAnalyticsSummaryQuery,
    useGetAnalyticsActivityQuery,
    useGetAnalyticsProfileViewsQuery,
    useGetAnalyticsUserActionsQuery,
} = analyticsApi
