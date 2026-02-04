/**
 * Example: Map with markers and interactions
 * This file demonstrates how to use the Map component with markers,
 * selection, and region change callbacks.
 *
 * Copy this code to your screen when you need to add markers.
 */

import React, { useState, useCallback } from 'react'
import { StyleSheet, View, Text } from 'react-native'

import { Map, MapMarker, Bounds, LatLng } from '../index'

export function MapWithMarkersExample() {
    // Example markers (e.g., businesses)
    const [markers] = useState<MapMarker[]>([
        {
            id: 'business-1',
            position: { lat: 41.9028, lng: 12.4964 }, // Rome
            title: 'Business 1',
            description: 'A great place',
        },
        {
            id: 'business-2',
            position: { lat: 41.9, lng: 12.5 },
            title: 'Business 2',
            description: 'Another location',
        },
        {
            id: 'business-3',
            position: { lat: 41.91, lng: 12.48 },
            title: 'Business 3',
            description: 'Third spot',
        },
    ])

    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
    const [currentRegion, setCurrentRegion] = useState<string>('Initial region')

    // Handle marker press
    const handleMarkerPress = useCallback((markerId: string) => {
        console.log('Marker pressed:', markerId)
        setSelectedMarkerId(markerId)
        // Here you might open a bottom sheet, navigate to detail screen, etc.
    }, [])

    // Handle region change (when user pans/zooms)
    const handleRegionChangeEnd = useCallback((bounds: Bounds, center: LatLng, zoom?: number) => {
        console.log('Region changed:', { bounds, center, zoom })
        setCurrentRegion(`Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | Zoom: ${zoom?.toFixed(1) ?? 'N/A'}`)
        // Here you might fetch new businesses in the visible area
    }, [])

    return (
        <View style={styles.container}>
            <Map
                initialCenter={{ lat: 41.9028, lng: 12.4964 }}
                initialZoom={13}
                markers={markers}
                selectedMarkerId={selectedMarkerId}
                onMarkerPress={handleMarkerPress}
                onRegionChangeEnd={handleRegionChangeEnd}
                showUserLocation={true}
                style={styles.map}
            />

            {/* Example overlay UI */}
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>{currentRegion}</Text>
                {selectedMarkerId && <Text style={styles.overlayText}>Selected: {selectedMarkerId}</Text>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    overlayText: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
    },
})
