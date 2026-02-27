import { baseApi } from '@/store/api/baseApi'

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
        }),
    }),
})

export const { useGetBusinessReviewsQuery, useCreateReviewMutation } = reviewsApi
