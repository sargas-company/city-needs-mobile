import { baseApi } from '@/store/api/baseApi'

import type { CreateReviewDto, CreateReviewResponse } from './reviews.types'

export const reviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createReview: builder.mutation<CreateReviewResponse, CreateReviewDto>({
            query: (data) => ({
                url: '/reviews',
                method: 'POST',
                data,
            }),
            invalidatesTags: [
                { type: 'Reviews', id: 'LIST' },
                { type: 'Bookings', id: 'LIST' },
            ],
        }),
    }),
})

export const { useCreateReviewMutation } = reviewsApi
