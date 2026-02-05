import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

const SIZE = 12
const BRAND = '#0C2A63'
const BORDER_COLOR = '#FFFFFF'
const BORDER_WIDTH = 2

/**
 * User location pin: brand color, white border, pulse animation (opacity 0.5 ↔ 1).
 */
export function UserLocationPin() {
    const opacity = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [opacity])

    const borderRadius = SIZE / 2

    return (
        <Animated.View
            style={[
                styles.pin,
                {
                    width: SIZE,
                    height: SIZE,
                    borderRadius,
                    backgroundColor: BRAND,
                    borderColor: BORDER_COLOR,
                    borderWidth: BORDER_WIDTH,
                    opacity,
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
