/**
 * Engine-agnostic map types.
 * These types should NOT leak any implementation details from react-native-maps or other engines.
 */

/**
 * Basic latitude/longitude coordinate
 */
export interface LatLng {
    lat: number
    lng: number
}

/**
 * Geographic bounds (bounding box)
 */
export interface Bounds {
    northeast: LatLng
    southwest: LatLng
}

/**
 * Map marker representation
 */
export interface MapMarker {
    id: string
    position: LatLng
    title?: string
    description?: string
}

/**
 * Camera/Region abstraction for map viewport
 */
export interface MapRegion {
    center: LatLng
    /**
     * Zoom level (optional, engine-specific interpretation)
     * Higher = more zoomed in
     */
    zoom?: number
    /**
     * Latitude delta (alternative to zoom for some engines)
     */
    latitudeDelta?: number
    /**
     * Longitude delta (alternative to zoom for some engines)
     */
    longitudeDelta?: number
}

/**
 * Supported map engines
 */
export type MapEngine = 'google' | 'mapbox'

/**
 * Callback when map region changes (user pans/zooms)
 */
export type OnRegionChangeEnd = (bounds: Bounds, center: LatLng, zoom?: number) => void

/**
 * Callback when marker is pressed
 */
export type OnMarkerPress = (markerId: string) => void
