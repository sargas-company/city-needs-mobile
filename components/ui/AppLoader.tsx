import React, { useEffect } from 'react'
import { View, type ViewProps } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, cancelAnimation } from 'react-native-reanimated'
import { twMerge } from 'tailwind-merge'

import LoaderIcon from '@/assets/images/loader.svg'

import { AppText } from './AppText'

type AppLoaderSize = 'xs' | 'sm' | 'md' | 'lg'

type AppLoaderProps = ViewProps & {
    /** Loader size: sm (48), md (80), lg (129) */
    size?: AppLoaderSize
    /** Show "Loading..." title */
    showTitle?: boolean
    /** Custom title text */
    title?: string
    /** Show subtitle */
    showSubtitle?: boolean
    /** Custom subtitle text */
    subtitle?: string
}

const SIZE_MAP: Record<AppLoaderSize, number> = {
    xs: 30,
    sm: 48,
    md: 80,
    lg: 129,
}

export const AppLoader: React.FC<AppLoaderProps> = ({ size = 'md', showTitle = false, title = 'Loading...', className, ...props }) => {
    const rotation = useSharedValue(0)

    useEffect(() => {
        // 100 оборотов, 2.5 сек на оборот = 250 сек
        rotation.value = withTiming(-36000, {
            duration: 250000,
            easing: Easing.linear,
        })

        return () => cancelAnimation(rotation)
    }, [rotation])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }))

    const iconSize = SIZE_MAP[size]

    return (
        <View className={twMerge('items-center justify-center gap-4', className)} {...props}>
            <Animated.View style={animatedStyle}>
                <LoaderIcon width={iconSize} height={iconSize} />
            </Animated.View>

            {showTitle && <AppText className="text-lg font-poppins text-brand">{title}</AppText>}
        </View>
    )
}
