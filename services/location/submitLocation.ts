import { reverseGeocode, requestLocationPermission, getCurrentPosition } from '@/services/location/LocationService'
import { LocationPermissionStatus, MeLocationResponseDto, StoredLocation } from '@/services/location/location.types'

export type SubmitGpsLocationParams = {
    onPermission: (status: LocationPermissionStatus) => void
    onStored: (payload: StoredLocation) => void
    sync: (payload: StoredLocation) => Promise<MeLocationResponseDto>
}

export const submitGpsLocation = async ({ onPermission, onStored, sync }: SubmitGpsLocationParams) => {
    const status = await requestLocationPermission()
    onPermission(status)
    if (status !== 'granted') {
        return { ok: false as const, reason: 'permission' }
    }

    const coords = await getCurrentPosition()
    const formattedAddress = await reverseGeocode(coords.lat, coords.lng)
    const payload: StoredLocation = {
        lat: coords.lat,
        lng: coords.lng,
        source: 'gps',
        formattedAddress,
        updatedAt: new Date().toISOString(),
    }

    onStored(payload)
    const response = await sync(payload)
    return { ok: true as const, payload, response }
}
