import * as Location from 'expo-location'
import { Linking } from 'react-native'

import { LocationPermissionStatus } from './location.types'

export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === Location.PermissionStatus.GRANTED) {
        return 'granted'
    }
    if (status === Location.PermissionStatus.DENIED) {
        return 'denied'
    }
    return 'undetermined'
}

export const getCurrentPosition = async () => {
    // Try to get fresh position first
    try {
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            mayShowUserSettingsDialog: true,
        })
        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        }
    } catch {
        // On failure (kCLErrorLocationUnknown), try last known position as fallback
        const lastKnown = await Location.getLastKnownPositionAsync()
        if (lastKnown) {
            return {
                lat: lastKnown.coords.latitude,
                lng: lastKnown.coords.longitude,
            }
        }
        // If no cached position, retry once with lower accuracy
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
        })
        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        }
    }
}

const formatReverseGeocode = (data: Location.LocationGeocodedAddress[]) => {
    if (!data.length) return undefined
    const first = data[0]
    const parts = [first.city, first.region, first.country].filter(Boolean)
    return parts.length ? parts.join(', ') : undefined
}

export const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
        const data = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
        return formatReverseGeocode(data)
    } catch {
        return undefined
    }
}

export const openSettings = async () => {
    await Linking.openSettings()
}
