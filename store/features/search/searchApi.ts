import { baseApi } from '@/store/api/baseApi'

import type { SearchBusinessesArgs, SearchBusinessesResponse } from './search.types'

const DEFAULT_LIMIT = 20

export const searchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        searchBusinesses: builder.query<SearchBusinessesResponse, SearchBusinessesArgs | void>({
            query: (args) => ({
                url: '/businesses',
                method: 'GET',
                params: {
                    cursor: args?.cursor ?? undefined,
                    limit: args?.limit ?? DEFAULT_LIMIT,
                    search: args?.search || undefined,
                    categoryId: args?.categoryId || undefined,
                    city: args?.city || undefined,
                    priceMin: args?.priceMin ?? undefined,
                    priceMax: args?.priceMax ?? undefined,
                    sort: args?.sort || undefined,
                    lat: args?.lat ?? undefined,
                    lng: args?.lng ?? undefined,
                    withinKm: args?.withinKm ?? undefined,
                    openNow: args?.openNow ?? undefined,
                    bestPrice: args?.bestPrice ?? undefined,
                    topRated: args?.topRated ?? undefined,
                    availabilityDate: args?.availabilityDate || undefined,
                    availabilityTime: args?.availabilityTime || undefined,
                },
            }),

            serializeQueryArgs: ({ queryArgs }) => {
                const { cursor: _cursor, ...filters } = queryArgs ?? {}
                return JSON.stringify(filters)
            },

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
                    ? [...result.data.map(({ id }) => ({ type: 'Businesses' as const, id })), { type: 'Businesses', id: 'LIST' }]
                    : [{ type: 'Businesses', id: 'LIST' }],

            // More aggressive cleanup for search results (pagination accumulates data)
            keepUnusedDataFor: 15,
        }),
    }),
})

export const { useSearchBusinessesQuery } = searchApi
