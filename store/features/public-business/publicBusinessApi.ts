import { baseApi } from '@/store/api/baseApi'

import type { AvailabilityResponse, GetAvailabilityArgs, PublicBusinessResponse, PublicServicesListResponse } from './publicBusiness.types'

export const publicBusinessApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicBusiness: builder.query<PublicBusinessResponse, string>({
            query: (businessId) => ({
                url: `/business/${businessId}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'PublicBusiness', id }],
        }),

        getPublicBusinessServices: builder.query<PublicServicesListResponse, string>({
            query: (businessId) => ({
                url: `/business/${businessId}/services`,
                method: 'GET',
            }),
            providesTags: (_result, _error, businessId) => [{ type: 'PublicBusiness', id: `${businessId}-services` }],
        }),

        getBusinessAvailability: builder.query<AvailabilityResponse, GetAvailabilityArgs>({
            query: ({ businessId, date, serviceIds }) => {
                const serviceIdsQuery = serviceIds.map((id) => `serviceIds=${encodeURIComponent(id)}`).join('&')
                return {
                    url: `/availability?businessId=${encodeURIComponent(businessId)}&date=${encodeURIComponent(date)}&${serviceIdsQuery}`,
                    method: 'GET',
                }
            },
            keepUnusedDataFor: 0,
            providesTags: ['Availability'],
        }),
    }),
})

export const { useGetPublicBusinessQuery, useGetPublicBusinessServicesQuery, useGetBusinessAvailabilityQuery, useLazyGetBusinessAvailabilityQuery } =
    publicBusinessApi
