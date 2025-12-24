// import React from 'react'
// import { Image, View } from 'react-native'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
//
//
// import WaveSvg from '@/assets/images/wave.svg'
// import BrandSvg from '@/assets/images/main_logo.svg'
//
// type WaveHeaderProps = {
//     height?: number // “высота” волны без safe-area
//     showLogo?: boolean
//     logoSize?: number
//     logoRight?: number
//     logoTop?: number
// }
//
// export const WaveHeader = ({ height = 190, showLogo = true, logoSize = 56, logoRight = 24, logoTop = 18 }: WaveHeaderProps) => {
//     const insets = useSafeAreaInsets()
//     const totalHeight = height + insets.top
//
//     return (
//         <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: totalHeight, zIndex: 0 }}>
//             <WaveSvg width="100%" height={totalHeight} />
//
//             {showLogo ? <BrandSvg width={logoSize} height={logoSize} style={{ position: 'absolute', right: logoRight, top: logoTop }} /> : null}
//         </View>
//     )
// }

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

import WaveSvg from '@/assets/images/wave.svg'
import LogoSvg from '@/assets/images/main_logo.svg'

type WaveHeaderProps = {
    height: number
    topInset: number
    showLogo?: boolean
    style?: ViewStyle
    logoTop?: number
    logoRight?: number
}

export const WaveHeader = ({ height, topInset, showLogo = false, style, logoTop = 14, logoRight = 18 }: WaveHeaderProps) => {
    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    height: topInset + height,
                },
                style,
            ]}
        >
            {' '}
            <View style={{ height: topInset, backgroundColor: '#113e95' }} />
            <View style={{ height, backgroundColor: '#FFFFFF' }}>
                <WaveSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
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
        backgroundColor: '#FFFFFF',
        zIndex: 1,
    },
    logoWrap: {
        position: 'absolute',
        zIndex: 1,
    },
})
