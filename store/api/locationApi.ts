import { baseApi } from '@/store/api/baseApi'
import { MeLocationResponseDto, StoredLocation } from '@/services/location/location.types'

export type AddressSearchRequest = { city: 'Saskatoon' | 'Regina'; query: string }

export type AddressSearchItemDto = {
    label: string
    location: { lat: number; lng: number }
    address: {
        addressLine1: string
        city: string
        state?: string
        countryCode: string
        zip?: string
    }
    placeId: string
}

export type AddressSearchResponseDto = { items: AddressSearchItemDto[] }

export const locationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        syncLocation: builder.mutation<MeLocationResponseDto, StoredLocation>({
            query: (payload) => ({
                url: '/auth/location',
                method: 'POST',
                data: {
                    lat: payload.lat,
                    lng: payload.lng,
                    source: payload.source,
                    provider: payload.provider,
                    placeId: payload.placeId,
                    formattedAddress: payload.formattedAddress,
                },
            }),
        }),
        getLocation: builder.query<MeLocationResponseDto, void>({
            query: () => ({
                url: '/auth/location',
                method: 'GET',
            }),
        }),

        addressSearch: builder.query<AddressSearchResponseDto, AddressSearchRequest>({
            query: ({ city, query }) => ({
                url: '/locations/address-search',
                method: 'GET',
                params: { city, query },
            }),
        }),
    }),
})

export const { useSyncLocationMutation, useGetLocationQuery, useAddressSearchQuery } = locationApi
