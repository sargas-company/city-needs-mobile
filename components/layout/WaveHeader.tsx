import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import WaveSvg from '@/assets/images/wave.svg'
import LogoSvg from '@/assets/images/main_logo.svg'

type WaveHeaderProps = {
    height?: number
    topInset?: number
    showLogo?: boolean
    style?: ViewStyle
    logoTop?: number
    logoRight?: number
}

export const WaveHeader = ({ height = 190, topInset = 62, showLogo = false, style, logoTop = 14, logoRight = 18 }: WaveHeaderProps) => {
    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    height: height,
                },
                style,
            ]}
        >
            {/*{' '}*/}
            {/*<View style={{ height: topInset, backgroundColor: '#FFFFFF' }} />*/}
            <View style={{ height }}>
                <WaveSvg width="100%" height="100%" preserveAspectRatio="xMidYMin meet" />
            </View>
            {showLogo ? (
                <View style={[styles.logoWrap, { top: topInset + logoTop, right: logoRight }]}>
                    <LogoSvg width={56} height={56} />
                </View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 1,
    },
    logoWrap: {
        position: 'absolute',
        zIndex: 1,
    },
})
