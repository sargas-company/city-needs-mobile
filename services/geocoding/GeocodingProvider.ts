import type { LocationProvider } from '@/services/location/location.types'

import { GooglePlacesProvider } from './providers/GooglePlacesProvider'
import { NominatimProvider } from './providers/NominatimProvider'
import { OpenMeteoProvider } from './providers/OpenMeteoProvider'

export type GeocodingResult = {
    id: string
    title: string
    subtitle?: string
    lat?: number
    lng?: number
    raw?: unknown
}

export type GeocodingDetails = {
    lat: number
    lng: number
    formattedAddress?: string
}

export type GeocodingProvider = {
    id: LocationProvider
    search: (query: string, limit: number, signal?: AbortSignal) => Promise<GeocodingResult[]>
    getDetails?: (id: string, signal?: AbortSignal) => Promise<GeocodingDetails | null>
}

export const getGeocodingProvider = (): GeocodingProvider => {
    const provider = process.env.EXPO_PUBLIC_GEOCODING_PROVIDER

    if (provider === 'nominatim') {
        return NominatimProvider()
    }

    if (provider === 'openmeteo') {
        return OpenMeteoProvider()
    }

    const googleKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    if (googleKey) {
        return GooglePlacesProvider(googleKey)
    }

    return OpenMeteoProvider()
}

export const getGeocodingProviderId = (): LocationProvider => {
    return getGeocodingProvider().id
}
