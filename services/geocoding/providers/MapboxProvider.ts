import type { GeocodingProvider } from '@/services/geocoding/GeocodingProvider'

export const MapboxProvider = (_apiKey: string): GeocodingProvider => ({
    id: 'mapbox',
    search: async () => {
        throw new Error('Mapbox provider is not configured')
    },
    getDetails: async () => {
        throw new Error('Mapbox provider is not configured')
    },
})
