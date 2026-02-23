import React, { useRef, useCallback } from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'

import { MapMarkerPin } from '../../components/MapMarkerPin'
import { UserLocationPin } from '../../components/UserLocationPin'
import { MapMarker, LatLng, Bounds, OnRegionChangeEnd, OnMarkerPress } from '../../types/map.types'
import { mapStyle } from './mapStyle'

interface GoogleMapAdapterProps {
    initialCenter: LatLng
    initialZoom?: number
    markers?: MapMarker[]
    selectedMarkerId?: string | null
    onMarkerPress?: OnMarkerPress
    onRegionChangeEnd?: OnRegionChangeEnd
    onPress?: () => void
    showUserLocation?: boolean
    userLocation?: LatLng | null
    searchRadiusKm?: 1 | 5 | null
    style?: ViewStyle
}

/**
 * GoogleMapAdapter: Adapter for react-native-maps with Google provider.
 * This is the ONLY component that imports from 'react-native-maps'.
 */
export function GoogleMapAdapter({
    initialCenter,
    initialZoom = 13,
    markers = [],
    selectedMarkerId,
    onMarkerPress,
    onRegionChangeEnd,
    onPress,
    showUserLocation = false,
    userLocation,
    searchRadiusKm,
    style,
}: GoogleMapAdapterProps) {
    const mapRef = useRef<MapView>(null)

    /**
     * Convert our domain LatLng + zoom to react-native-maps Region
     * Zoom level approximation: higher zoom = smaller delta
     * Formula: delta ≈ 360 / (2^zoom)
     */
    const getInitialRegion = useCallback((): Region => {
        const delta = 360 / Math.pow(2, initialZoom)
        return {
            latitude: initialCenter.lat,
            longitude: initialCenter.lng,
            latitudeDelta: delta,
            longitudeDelta: delta,
        }
    }, [initialCenter, initialZoom])

    /**
     * Handle region change complete
     * Compute bounds (NE/SW corners) and center, then call callback
     */
    const handleRegionChangeComplete = useCallback(
        async (region: Region) => {
            if (!onRegionChangeEnd || !mapRef.current) return

            try {
                // Get map boundaries
                const boundaries = await mapRef.current.getMapBoundaries()

                const bounds: Bounds = {
                    northeast: {
                        lat: boundaries.northEast.latitude,
                        lng: boundaries.northEast.longitude,
                    },
                    southwest: {
                        lat: boundaries.southWest.latitude,
                        lng: boundaries.southWest.longitude,
                    },
                }

                const center: LatLng = {
                    lat: region.latitude,
                    lng: region.longitude,
                }

                // Approximate zoom from latitudeDelta (reverse of our initial calculation)
                // zoom ≈ log2(360 / latitudeDelta)
                const approximateZoom = region.latitudeDelta > 0 ? Math.log2(360 / region.latitudeDelta) : undefined

                onRegionChangeEnd(bounds, center, approximateZoom)
            } catch {
                // If getMapBoundaries fails, we still call the callback with basic info
                const center: LatLng = {
                    lat: region.latitude,
                    lng: region.longitude,
                }
                // Create approximate bounds from region deltas
                const bounds: Bounds = {
                    northeast: {
                        lat: region.latitude + region.latitudeDelta / 2,
                        lng: region.longitude + region.longitudeDelta / 2,
                    },
                    southwest: {
                        lat: region.latitude - region.latitudeDelta / 2,
                        lng: region.longitude - region.longitudeDelta / 2,
                    },
                }
                const approximateZoom = region.latitudeDelta > 0 ? Math.log2(360 / region.latitudeDelta) : undefined
                onRegionChangeEnd(bounds, center, approximateZoom)
            }
        },
        [onRegionChangeEnd]
    )

    /**
     * Handle marker press
     */
    const handleMarkerPress = useCallback(
        (markerId: string) => {
            if (onMarkerPress) {
                onMarkerPress(markerId)
            }
        },
        [onMarkerPress]
    )

    return (
        <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            style={[styles.map, style]}
            initialRegion={getInitialRegion()}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={onPress}
            showsUserLocation={!userLocation && showUserLocation}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={false}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
        >
            {/* Always render Circle to prevent child index shifts when filter toggles */}
            {userLocation && (
                <Circle
                    key="search-radius-circle"
                    center={{
                        latitude: userLocation.lat,
                        longitude: userLocation.lng,
                    }}
                    radius={searchRadiusKm ? searchRadiusKm * 1000 : 0}
                    fillColor={searchRadiusKm ? 'rgba(231, 159, 72, 0.08)' : 'transparent'}
                    strokeColor={searchRadiusKm ? '#E79F48' : 'transparent'}
                    strokeWidth={searchRadiusKm ? 3 : 0}
                />
            )}

            {/* Always render user location marker to prevent child index shifts */}
            <Marker
                key="user-location-marker"
                coordinate={{
                    latitude: userLocation?.lat ?? 0,
                    longitude: userLocation?.lng ?? 0,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                opacity={userLocation ? 1 : 0}
            >
                <UserLocationPin />
            </Marker>

            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={{
                        latitude: marker.position.lat,
                        longitude: marker.position.lng,
                    }}
                    tracksViewChanges={true}
                    onPress={() => handleMarkerPress(marker.id)}
                    opacity={selectedMarkerId && selectedMarkerId !== marker.id ? 0.6 : 1}
                >
                    <MapMarkerPin />
                </Marker>
            ))}
        </MapView>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
})
