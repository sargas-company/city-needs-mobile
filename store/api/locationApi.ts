import { baseApi } from '@/store/api/baseApi'
import { MeLocationResponseDto, StoredLocation } from '@/services/location/location.types'

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
    }),
})

export const { useSyncLocationMutation, useGetLocationQuery } = locationApi
