import type { GeocodingProvider } from '@/services/geocoding/GeocodingProvider'

export const GooglePlacesProvider = (_apiKey: string): GeocodingProvider => ({
    id: 'google',
    search: async () => {
        throw new Error('Google Places provider is not configured')
    },
    getDetails: async () => {
        throw new Error('Google Places provider is not configured')
    },
})
