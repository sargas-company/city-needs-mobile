import { baseApi } from '@/store/api/baseApi'

export type CategoriesQueryParams = {
    search?: string
    requiresVerification?: boolean
    hasGracePeriod?: boolean
}

export type CategoryType = {
    id: string
    title: string
    slug: string
    description: string | null
    requiresVerification: boolean
    gracePeriodHours: number | null
    imageUrl: string | null
    bgColor: string | null
}

export const categoriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<CategoryType[], CategoriesQueryParams | void>({
            query: (params) => ({
                url: '/categories',
                method: 'GET',
                params: params ?? undefined,
            }),
        }),
    }),
})

export const { useGetCategoriesQuery } = categoriesApi
