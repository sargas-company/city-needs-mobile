import React from 'react'
import { StyleSheet, View } from 'react-native'

const SIZE = 20
const COLOR = '#E79F48'
const BORDER_COLOR = '#FFFFFF'
const BORDER_WIDTH = 2

export interface MapMarkerPinProps {
    /** Pin size in px. Default: 10 */
    size?: number
    /** Fill color. Default: #E79F48 */
    color?: string
    /** Border color. Default: white */
    borderColor?: string
    /** Border width in px. Default: 1 */
    borderWidth?: number
}

/**
 * Custom map marker pin: small rounded dot with border.
 * Used as Marker child in GoogleMapAdapter.
 */
export function MapMarkerPin({ size = SIZE, color = COLOR, borderColor = BORDER_COLOR, borderWidth = BORDER_WIDTH }: MapMarkerPinProps = {}) {
    const borderRadius = size / 2
    return (
        <View
            style={[
                styles.pin,
                {
                    width: size,
                    height: size,
                    borderRadius,
                    backgroundColor: color,
                    borderColor,
                    borderWidth,
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    pin: {
        alignSelf: 'center',
    },
})
