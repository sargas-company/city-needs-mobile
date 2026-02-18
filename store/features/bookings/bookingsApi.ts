import { baseApi } from '@/store/api/baseApi'

import type {
    BookingListResponse,
    BookingResponse,
    BusinessBookingListResponse,
    CancelBookingDto,
    CreateBookingDto,
    GetBusinessBookingsArgs,
    GetMyBookingsArgs,
    UpdateBookingStatusDto,
} from './bookings.types'

const DEFAULT_LIMIT = 10

export const bookingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyBookings: builder.query<BookingListResponse, GetMyBookingsArgs | void>({
            query: (args) => ({
                url: '/bookings/me',
                method: 'GET',
                params: {
                    cursor: args && 'cursor' in args ? (args.cursor ?? undefined) : undefined,
                    limit: args && 'limit' in args ? (args.limit ?? DEFAULT_LIMIT) : DEFAULT_LIMIT,
                    withoutReview: args && 'withoutReview' in args ? args.withoutReview : undefined,
                },
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${queryArgs?.withoutReview ? 'awaitingReview' : 'all'}`
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                (currentArg?.cursor ?? null) !== (previousArg?.cursor ?? null) ||
                Boolean(currentArg?.withoutReview) !== Boolean(previousArg?.withoutReview),
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
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ id }) => ({ type: 'Bookings' as const, id })), { type: 'Bookings', id: 'LIST' }]
                    : [{ type: 'Bookings', id: 'LIST' }],

            keepUnusedDataFor: 20,
        }),

        getBusinessBookings: builder.query<BusinessBookingListResponse, GetBusinessBookingsArgs | void>({
            query: (args) => ({
                url: '/business/bookings',
                method: 'GET',
                params: {
                    cursor: args?.cursor ?? undefined,
                    limit: args?.limit ?? DEFAULT_LIMIT,
                    status: args?.status ?? undefined,
                    date: args?.date ?? undefined,
                },
            }),
            serializeQueryArgs: ({ endpointName }) => endpointName,
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
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ id }) => ({ type: 'Bookings' as const, id })), { type: 'Bookings', id: 'BUSINESS_LIST' }]
                    : [{ type: 'Bookings', id: 'BUSINESS_LIST' }],

            keepUnusedDataFor: 20,
        }),

        createBooking: builder.mutation<BookingResponse, CreateBookingDto>({
            query: (data) => ({
                url: '/bookings',
                method: 'POST',
                data,
            }),
            invalidatesTags: [{ type: 'Bookings', id: 'LIST' }],
        }),

        cancelBooking: builder.mutation<BookingResponse, { id: string; data: CancelBookingDto }>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}/cancel`,
                method: 'POST',
                data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Bookings', id },
                { type: 'Bookings', id: 'LIST' },
            ],
        }),

        updateBookingStatus: builder.mutation<BookingResponse, { id: string; data: UpdateBookingStatusDto }>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}/status`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Bookings', id },
                { type: 'Bookings', id: 'LIST' },
            ],
        }),
    }),
})

export const {
    useGetMyBookingsQuery,
    useLazyGetMyBookingsQuery,
    useGetBusinessBookingsQuery,
    useCreateBookingMutation,
    useCancelBookingMutation,
    useUpdateBookingStatusMutation,
} = bookingsApi
