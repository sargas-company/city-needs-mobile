import { baseApi } from '@/store/api/baseApi'
import { reelsApi } from '@/store/features/reels/reelsApi'
import { publicBusinessApi } from '@/store/features/public-business/publicBusinessApi'
import type { GetReelsFeedResponse } from '@/store/features/reels/reels.types'

import type { CreateReviewDto, CreateReviewResponse, GetBusinessReviewsArgs, ReviewListResponse } from './reviews.types'

const DEFAULT_LIMIT = 10

export const reviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessReviews: builder.query<ReviewListResponse, GetBusinessReviewsArgs>({
            query: ({ businessId, cursor, limit }) => ({
                url: `/reviews/business/${businessId}`,
                method: 'GET',
                params: {
                    cursor: cursor ?? undefined,
                    limit: limit ?? DEFAULT_LIMIT,
                },
            }),
            serializeQueryArgs: ({ queryArgs }) => `businessReviews-${queryArgs.businessId}`,
            forceRefetch: ({ currentArg, previousArg }) => (currentArg?.cursor ?? null) !== (previousArg?.cursor ?? null),
            merge: (currentCache, newResp, ctx) => {
                const cursor = ctx.arg?.cursor ?? null

                if (!cursor) {
                    currentCache.code = newResp.code
                    currentCache.data = newResp.data
                    currentCache.meta = newResp.meta
                    return
                }

                const existingIds = new Set(currentCache.data.map((x) => x.id))
                const appended = newResp.data.filter((x) => !existingIds.has(x.id))

                currentCache.code = newResp.code
                currentCache.data.push(...appended)
                currentCache.meta = newResp.meta
            },
            providesTags: (result, _error, { businessId }) =>
                result?.data
                    ? [...result.data.map(({ id }) => ({ type: 'Reviews' as const, id })), { type: 'Reviews', id: `business-${businessId}` }]
                    : [{ type: 'Reviews', id: `business-${businessId}` }],
        }),

        createReview: builder.mutation<CreateReviewResponse, CreateReviewDto>({
            query: ({ bookingId, rating, comment }) => ({
                url: '/reviews',
                method: 'POST',
                data: { bookingId, rating, comment },
            }),
            invalidatesTags: (_result, _error, { businessId }) => [
                { type: 'Reviews', id: `business-${businessId}` },
                { type: 'PublicBusiness', id: businessId },
                { type: 'Bookings', id: 'LIST' },
            ],
            async onQueryStarted({ businessId }, { dispatch, queryFulfilled, getState }) {
                try {
                    await queryFulfilled

                    // Fetch fresh business data (cache was invalidated, so this gets fresh data)
                    const businessResult = await dispatch(publicBusinessApi.endpoints.getPublicBusiness.initiate(businessId, { forceRefetch: true }))

                    if (businessResult.data) {
                        const { ratingAvg, ratingCount } = businessResult.data

                        // Get all reels feed cache keys and update each one
                        const state = getState() as { api: { queries: Record<string, unknown> } }
                        const reelsCacheKeys = Object.keys(state.api.queries).filter((key) => key.startsWith('getReelsFeed'))

                        for (const cacheKey of reelsCacheKeys) {
                            // Extract the serialized args from cache key (format: "getReelsFeed(serializedArgs)")
                            const argsMatch = cacheKey.match(/^getReelsFeed\((.+)\)$/)
                            if (argsMatch) {
                                try {
                                    const serializedArgs = argsMatch[1]
                                    // The args were serialized with JSON.stringify, so parse them back
                                    const args = serializedArgs === 'undefined' ? undefined : JSON.parse(serializedArgs)

                                    dispatch(
                                        reelsApi.util.updateQueryData('getReelsFeed', args, (draft: GetReelsFeedResponse) => {
                                            const item = draft.items?.find((r) => r.business.id === businessId)
                                            if (item) {
                                                item.business.ratingAvg = ratingAvg ?? 0
                                                item.business.ratingCount = ratingCount ?? 0
                                            }
                                        })
                                    )
                                } catch {
                                    // Skip invalid cache entries
                                }
                            }
                        }
                    }
                } catch {
                    // Mutation failed, no cache update needed
                }
            },
        }),
    }),
})

export const { useGetBusinessReviewsQuery, useCreateReviewMutation } = reviewsApi
