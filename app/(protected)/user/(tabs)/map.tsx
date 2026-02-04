import React from 'react'
import { StyleSheet, View } from 'react-native'

import { Map } from '@/src/features/map'

/**
 * MapScreen: Main map view for users to explore businesses
 * Default center: Rome, Italy (41.9028, 12.4964)
 */
export default function MapScreen() {
    return (
        <View style={styles.container}>
            <Map initialCenter={{ lat: 41.9028, lng: 12.4964 }} initialZoom={13} showUserLocation={true} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
