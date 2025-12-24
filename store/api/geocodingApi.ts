import { baseApi } from '@/store/api/baseApi'
import { getGeocodingProvider } from '@/services/geocoding/GeocodingProvider'
import type { GeocodingDetails, GeocodingResult } from '@/services/geocoding/GeocodingProvider'

export type SearchLocationsArgs = {
    query: string
    limit?: number
}

export type LocationDetailsArgs = {
    id: string
}

export const geocodingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        searchLocations: builder.query<GeocodingResult[], SearchLocationsArgs>({
            queryFn: async (args, api) => {
                try {
                    const provider = getGeocodingProvider()
                    const results = await provider.search(args.query, args.limit ?? 15, api.signal)
                    return { data: results }
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: (error as Error).message ?? 'Failed to search locations',
                        },
                    }
                }
            },
        }),
        getLocationDetails: builder.query<GeocodingDetails, LocationDetailsArgs>({
            queryFn: async (args, api) => {
                try {
                    const provider = getGeocodingProvider()
                    if (!provider.getDetails) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                data: 'Details provider is not available',
                            },
                        }
                    }
                    const details = await provider.getDetails(args.id, api.signal)
                    if (!details) {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                data: 'Location details not found',
                            },
                        }
                    }
                    return { data: details }
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: (error as Error).message ?? 'Failed to load location details',
                        },
                    }
                }
            },
        }),
    }),
})

export const { useLazySearchLocationsQuery, useLazyGetLocationDetailsQuery } = geocodingApi
