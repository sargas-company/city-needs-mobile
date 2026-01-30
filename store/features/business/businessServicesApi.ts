import { baseApi } from '@/store/api/baseApi'

export type BusinessServiceDto = {
    id: string
    name: string
    price: number
    duration: number
    position: number
    businessId: string
    createdAt: string
    updatedAt: string
}

export type CreateBusinessServiceDto = {
    name: string
    price: number
    duration: number
    position?: number
}

export type UpdateBusinessServiceDto = {
    name?: string
    price?: number
    duration?: number
    position?: number
}

export type UpdateBusinessServiceArgs = {
    id: string
    data: UpdateBusinessServiceDto
}

export type GetBusinessServicesArgs = {
    cursor?: string | null
    limit?: number
}

export type CursorPaginationMeta = {
    nextCursor: string | null
    totalCount: number
    totalPages: number
    hasNextPage: boolean
}

export type BusinessServiceResponse = {
    code?: number
    data: BusinessServiceDto
    message?: string
}

export type BusinessServicesListResponse = {
    code?: number
    data: BusinessServiceDto[]
    meta: CursorPaginationMeta
}

export type DeleteBusinessServiceResponse = {
    code?: number
    data: null
    message?: string
}

const DEFAULT_LIMIT = 10

export const businessServicesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessServices: builder.query<BusinessServicesListResponse, GetBusinessServicesArgs | void>({
            query: (args) => ({
                url: '/business/me/services',
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
            providesTags: (result) =>
                result?.data
                    ? [...result.data.map(({ id }) => ({ type: 'BusinessServices' as const, id })), { type: 'BusinessServices', id: 'LIST' }]
                    : [{ type: 'BusinessServices', id: 'LIST' }],
        }),

        createBusinessService: builder.mutation<BusinessServiceResponse, CreateBusinessServiceDto>({
            query: (data) => ({
                url: '/business/me/services',
                method: 'POST',
                data,
            }),
            invalidatesTags: [{ type: 'BusinessServices', id: 'LIST' }],
        }),

        updateBusinessService: builder.mutation<BusinessServiceResponse, UpdateBusinessServiceArgs>({
            query: ({ id, data }) => ({
                url: `/business/me/services/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'BusinessServices', id },
                { type: 'BusinessServices', id: 'LIST' },
            ],
        }),

        deleteBusinessService: builder.mutation<DeleteBusinessServiceResponse, string>({
            query: (id) => ({
                url: `/business/me/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'BusinessServices', id: 'LIST' }],
        }),
    }),
})

export const { useGetBusinessServicesQuery, useCreateBusinessServiceMutation, useUpdateBusinessServiceMutation, useDeleteBusinessServiceMutation } =
    businessServicesApi
