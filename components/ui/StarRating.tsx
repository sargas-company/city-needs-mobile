import React from 'react'
import { View } from 'react-native'

import MoonGray from '@/assets/images/moon_gray.svg'
import MoonYellow from '@/assets/images/moon_yellow.svg'

import { AppPressable } from './AppPressable'

type StarRatingProps = {
    rating: number
    maxStars?: number
    size?: number
    onChange?: (rating: number) => void
    readonly?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 5, size = 32, onChange, readonly = false }) => {
    const stars = Array.from({ length: maxStars }, (_, i) => i + 1)

    const getFill = (starIndex: number) => {
        if (rating >= starIndex) return 1
        if (rating >= starIndex - 0.5) return 0.5
        return 0
    }

    const handlePress = (starIndex: number) => {
        if (readonly || !onChange) return
        onChange(starIndex)
    }

    return (
        <View className="flex-row items-center" style={{ gap: size * 0.25 }}>
            {stars.map((starIndex) => {
                const fill = getFill(starIndex)

                const MoonIcon = (
                    <View style={{ width: size, height: size }}>
                        <MoonGray width={size} height={size} />

                        {fill > 0 && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: size * fill,
                                    height: size,
                                    overflow: 'hidden',
                                }}
                            >
                                <MoonYellow width={size} height={size} />
                            </View>
                        )}
                    </View>
                )

                if (readonly) return <View key={starIndex}>{MoonIcon}</View>

                return (
                    <AppPressable key={starIndex} onPress={() => handlePress(starIndex)}>
                        {MoonIcon}
                    </AppPressable>
                )
            })}
        </View>
    )
}
