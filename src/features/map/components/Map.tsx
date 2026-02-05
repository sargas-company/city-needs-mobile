import React from 'react'
import { ViewStyle } from 'react-native'

import { useMapEngine } from '../context/MapProvider'
import { GoogleMapAdapter } from '../adapters/google/GoogleMapAdapter'
import { LatLng, MapMarker, OnMarkerPress, OnRegionChangeEnd } from '../types/map.types'

export interface MapProps {
    /**
     * Initial center position of the map
     */
    initialCenter: LatLng

    /**
     * Initial zoom level (higher = more zoomed in)
     * Default: 13
     */
    initialZoom?: number

    /**
     * Array of markers to display on the map
     */
    markers?: MapMarker[]

    /**
     * ID of the currently selected marker (for highlighting)
     */
    selectedMarkerId?: string | null

    /**
     * Callback when a marker is pressed
     */
    onMarkerPress?: OnMarkerPress

    /**
     * Callback when map region changes (pan/zoom complete)
     */
    onRegionChangeEnd?: OnRegionChangeEnd

    /**
     * Show user's current location (native blue dot when no userLocation)
     */
    showUserLocation?: boolean

    /**
     * Custom user location marker (brand color, pulse). When provided, uses our pin instead of native dot.
     */
    userLocation?: LatLng | null

    /**
     * Custom style for the map container
     */
    style?: ViewStyle

    /**
     * NativeWind className (if using Tailwind)
     */
    className?: string
}

/**
 * Map: Engine-agnostic map component facade.
 * This component automatically selects the correct adapter based on MapProvider context.
 * Screens should ONLY import this component, not the adapters directly.
 */
export function Map({
    initialCenter,
    initialZoom = 13,
    markers,
    selectedMarkerId,
    onMarkerPress,
    onRegionChangeEnd,
    showUserLocation = false,
    userLocation,
    style,
}: MapProps) {
    const engine = useMapEngine()

    // Future: Add more engine adapters here
    // case 'mapbox': return <MapboxAdapter ... />
    // case 'apple': return <AppleMapAdapter ... />

    switch (engine) {
        case 'google':
            return (
                <GoogleMapAdapter
                    initialCenter={initialCenter}
                    initialZoom={initialZoom}
                    markers={markers}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerPress={onMarkerPress}
                    onRegionChangeEnd={onRegionChangeEnd}
                    showUserLocation={showUserLocation}
                    userLocation={userLocation}
                    style={style}
                />
            )
        case 'mapbox':
            // TODO: Implement MapboxAdapter when needed
            throw new Error('Mapbox adapter not yet implemented')
        default:
            throw new Error(`Unknown map engine: ${engine}`)
    }
}
