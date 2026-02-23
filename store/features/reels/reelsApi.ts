import { baseApi } from '@/store/api/baseApi'

import type {
    DeleteMyReelArgs,
    DeleteMyReelResponse,
    GetMyReelResponse,
    GetReelsFeedArgs,
    GetReelsFeedResponse,
    UpsertMyReelArgs,
    UpsertMyReelResponse,
} from './reels.types'

const DEFAULT_LIMIT = 10

export const reelsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyReel: builder.query<GetMyReelResponse, void>({
            query: () => ({
                url: '/business/me/reel',
                method: 'GET',
            }),
            providesTags: [{ type: 'Reels', id: 'MY_REEL' }],
        }),

        upsertMyReel: builder.mutation<UpsertMyReelResponse, UpsertMyReelArgs>({
            query: (file) => {
                const formData = new FormData()
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any)

                return {
                    url: '/business/me/reel',
                    method: 'POST',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            },
            invalidatesTags: [
                { type: 'Reels', id: 'MY_REEL' },
                { type: 'Reels', id: 'FEED' },
            ],
        }),

        deleteMyReel: builder.mutation<DeleteMyReelResponse, DeleteMyReelArgs>({
            query: ({ reelId }) => ({
                url: `/business/me/reel/${reelId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Reels', id: 'MY_REEL' },
                { type: 'Reels', id: 'FEED' },
            ],
        }),

        getReelsFeed: builder.query<GetReelsFeedResponse, GetReelsFeedArgs | void>({
            query: (args) => ({
                url: '/reels',
                method: 'GET',
                params: {
                    cursor: args?.cursor ?? undefined,
                    limit: args?.limit ?? DEFAULT_LIMIT,
                    search: args?.search || undefined,
                    categoryId: args?.categoryId || undefined,
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
                    currentCache.items = newResp.items
                    currentCache.nextCursor = newResp.nextCursor
                    currentCache.hasNextPage = newResp.hasNextPage
                    return
                }

                const existingIds = new Set(currentCache.items.map((x) => x.id))
                const appended = newResp.items.filter((x) => !existingIds.has(x.id))

                currentCache.items.push(...appended)
                currentCache.nextCursor = newResp.nextCursor
                currentCache.hasNextPage = newResp.hasNextPage
            },

            providesTags: (result) =>
                result?.items
                    ? [...result.items.map(({ id }) => ({ type: 'Reels' as const, id })), { type: 'Reels', id: 'FEED' }]
                    : [{ type: 'Reels', id: 'FEED' }],

            // Aggressive cleanup for reels feed (video metadata can be heavy)
            keepUnusedDataFor: 15,
        }),
    }),
})

export const { useGetMyReelQuery, useUpsertMyReelMutation, useDeleteMyReelMutation, useGetReelsFeedQuery } = reelsApi
