import { baseApi } from '@/store/api/baseApi'

import type { SavedBusinessesActionResponse, SavedBusinessesListResponse } from './savedBusinesses.types'

export type GetSavedBusinessesArgs = {
    cursor?: string | null
    limit?: number
}

const DEFAULT_LIMIT = 10

export const savedBusinessesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSavedBusinesses: builder.query<SavedBusinessesListResponse, GetSavedBusinessesArgs | void>({
            query: (args) => ({
                url: '/saved-businesses',
                method: 'GET',
                params: {
                    cursor: args && 'cursor' in args ? (args.cursor ?? undefined) : undefined,
                    limit: args && 'limit' in args ? (args.limit ?? DEFAULT_LIMIT) : DEFAULT_LIMIT,
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

            providesTags: [{ type: 'SavedBusinesses', id: 'LIST' }],
        }),

        addSavedBusiness: builder.mutation<SavedBusinessesActionResponse, { businessId: string }>({
            query: ({ businessId }) => ({
                url: `/saved-businesses/${businessId}`,
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'SavedBusinesses', id: 'LIST' }],
        }),

        removeSavedBusiness: builder.mutation<SavedBusinessesActionResponse, { businessId: string }>({
            query: ({ businessId }) => ({
                url: `/saved-businesses/${businessId}`,
                method: 'DELETE',
            }),

            // async onQueryStarted({ businessId }, { dispatch, queryFulfilled }) {
            //     const patch = dispatch(
            //         savedBusinessesApi.util.updateQueryData('getSavedBusinesses', undefined, (draft) => {
            //             const before = draft.data.length
            //             draft.data = draft.data.filter((x) => x.id !== businessId)
            //             const removed = before - draft.data.length
            //
            //             if (removed > 0 && typeof draft.meta?.totalCount === 'number') {
            //                 draft.meta.totalCount = Math.max(0, draft.meta.totalCount - removed)
            //             }
            //         })
            //     )
            //
            //     try {
            //         await queryFulfilled
            //     } catch {
            //         patch.undo()
            //     }
            // },

            invalidatesTags: [{ type: 'SavedBusinesses', id: 'LIST' }],
        }),
    }),
})

export const { useGetSavedBusinessesQuery, useAddSavedBusinessMutation, useRemoveSavedBusinessMutation } = savedBusinessesApi
