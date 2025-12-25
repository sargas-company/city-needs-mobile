export type LocationSource = 'gps' | 'manual'
export type LocationProvider = 'open-meteo' | 'nominatim' | 'google' | 'mapbox'
export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined'

export type MeLocationDto = {
    lat: number
    lng: number
    source: LocationSource
    provider?: string
    placeId?: string
    formattedAddress?: string
    updatedAt: string
}

export type MeLocationResponseDto = {
    ok: true
    location: MeLocationDto | null
}

export type StoredLocation = {
    lat: number
    lng: number
    source: LocationSource
    provider?: LocationProvider | string
    placeId?: string
    formattedAddress?: string
    updatedAt: string
}
