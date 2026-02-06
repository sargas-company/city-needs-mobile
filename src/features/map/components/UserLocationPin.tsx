import React from 'react'
import { StyleSheet, View } from 'react-native'

const SIZE = 20
const BRAND = '#0C2A63'
const BORDER_COLOR = '#FFFFFF'
const BORDER_WIDTH = 2

/**
 * User location pin: brand color, white border, pulse animation (opacity 0.5 ↔ 1).
 */
export function UserLocationPin() {
    const borderRadius = SIZE / 2

    return (
        <View
            style={[
                styles.pin,
                {
                    width: SIZE,
                    height: SIZE,
                    borderRadius,
                    backgroundColor: BRAND,
                    borderColor: BORDER_COLOR,
                    borderWidth: BORDER_WIDTH,
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
