import { baseApi } from '@/store/api/baseApi'

export type Category = {
    id: string
    name: string
}

export const categoriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        categories: builder.query<Category[], void>({
            query: () => ({
                url: '/categories',
                method: 'GET',
            }),
        }),
    }),
})

export const { useCategoriesQuery } = categoriesApi
