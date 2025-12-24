export type LocationSource = 'gps' | 'manual'
export type LocationProvider = 'open-meteo' | 'nominatim' | 'google' | 'mapbox'
export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined'

export type StoredLocation = {
    lat: number
    lng: number
    source: LocationSource
    provider?: LocationProvider
    placeId?: string
    formattedAddress?: string
    updatedAt: string
}
