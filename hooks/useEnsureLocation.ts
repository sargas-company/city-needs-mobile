import { useEffect, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import * as Location from 'expo-location'

import { getCurrentPosition } from '@/services/location/LocationService'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { selectLocation, selectLocationPermission } from '@/store/features/location/location.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

// Location is considered stale after 30 minutes
const STALE_THRESHOLD_MS = 30 * 60 * 1000

/**
 * Ensures location is available in Redux store.
 *
 * Features:
 * - Auto-fetches location on mount if not available
 * - Handles "undetermined" permission by requesting it
 * - Re-checks permission when app returns from background (for settings changes)
 * - Refreshes stale location (older than 30 minutes)
 *
 * Returns current location, permission status, and a manual refresh function.
 */
export function useEnsureLocation() {
    const dispatch = useAppDispatch()
    const location = useAppSelector(selectLocation)
    const permission = useAppSelector(selectLocationPermission)
    const appState = useRef(AppState.currentState)

    const refreshLocation = useCallback(
        async (options?: { requestPermission?: boolean }) => {
            try {
                // Check current permission status
                let { status } = await Location.getForegroundPermissionsAsync()

                // If undetermined and requestPermission is true, ask the user
                if (status === Location.PermissionStatus.UNDETERMINED && options?.requestPermission) {
                    const response = await Location.requestForegroundPermissionsAsync()
                    status = response.status
                }

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
                } else {
                    dispatch(setLocationPermission('undetermined'))
                }
            } catch (error) {
                console.warn('Failed to refresh location:', error)
            }
            return null
        },
        [dispatch]
    )

    // Check if location is stale (older than threshold)
    const isLocationStale = useCallback(() => {
        if (!location?.updatedAt) return true
        const updatedAt = new Date(location.updatedAt).getTime()
        return Date.now() - updatedAt > STALE_THRESHOLD_MS
    }, [location?.updatedAt])

    // Auto-refresh on mount
    useEffect(() => {
        const shouldRefresh =
            // No location at all
            !location ||
            // Have location but it's stale (only for GPS, not manual)
            (location.source === 'gps' && isLocationStale())

        if (shouldRefresh && permission !== 'denied') {
            // Request permission only if undetermined
            refreshLocation({ requestPermission: permission === 'undetermined' })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Re-check permission when app returns from background
    // This handles the case when user enables location in Settings
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            // App came to foreground
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // Only re-check if permission was denied (user might have changed it in Settings)
                if (permission === 'denied') {
                    refreshLocation()
                }
                // Also refresh if location is stale
                else if (location?.source === 'gps' && isLocationStale()) {
                    refreshLocation()
                }
            }
            appState.current = nextAppState
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription.remove()
    }, [permission, location?.source, isLocationStale, refreshLocation])

    return { location, permission, refreshLocation }
}
