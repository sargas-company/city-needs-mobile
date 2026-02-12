import { analyticsApi } from './analyticsApi'

// Select summary data
export const selectAnalyticsSummary = analyticsApi.endpoints.getAnalyticsSummary.select()

// Select activity data
export const selectAnalyticsActivity = analyticsApi.endpoints.getAnalyticsActivity.select()

// Select profile views data
export const selectAnalyticsProfileViews = analyticsApi.endpoints.getAnalyticsProfileViews.select()

// Select user actions data
export const selectAnalyticsUserActions = analyticsApi.endpoints.getAnalyticsUserActions.select()
