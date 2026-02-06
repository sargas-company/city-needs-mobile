import { useEffect, useCallback } from 'react'
import * as Location from 'expo-location'

import { getCurrentPosition } from '@/services/location/LocationService'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { selectLocation, selectLocationPermission } from '@/store/features/location/location.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/**
 * Ensures location is available in Redux store.
 * If location is null but permission is granted, fetches current position.
 * Returns current location and a manual refresh function.
 */
export function useEnsureLocation() {
    const dispatch = useAppDispatch()
    const location = useAppSelector(selectLocation)
    const permission = useAppSelector(selectLocationPermission)

    const refreshLocation = useCallback(async () => {
        try {
            // Check current permission status
            const { status } = await Location.getForegroundPermissionsAsync()

            if (status === Location.PermissionStatus.GRANTED) {
                dispatch(setLocationPermission('granted'))
                const coords = await getCurrentPosition()
                dispatch(
                    setLocation({
                        lat: coords.lat,
                        lng: coords.lng,
                        source: 'gps',
                        updatedAt: new Date().toISOString(),
                    })
                )
                return coords
            } else if (status === Location.PermissionStatus.DENIED) {
                dispatch(setLocationPermission('denied'))
            }
        } catch (error) {
            console.warn('Failed to refresh location:', error)
        }
        return null
    }, [dispatch])

    // Auto-refresh on mount if location is null but we haven't checked permission yet
    useEffect(() => {
        if (!location && permission !== 'denied') {
            refreshLocation()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return { location, permission, refreshLocation }
}
