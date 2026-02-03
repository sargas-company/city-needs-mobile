import React from 'react'
import { View } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import { AppPressable } from './AppPressable'

type StarRatingProps = {
    rating: number
    maxStars?: number
    size?: number
    color?: string
    emptyColor?: string
    onChange?: (rating: number) => void
    readonly?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxStars = 5,
    size = 32,
    color = '#E8A230',
    emptyColor = '#E8A230',
    onChange,
    readonly = false,
}) => {
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

                const StarIcon = (
                    <View style={{ width: size, height: size }}>
                        {/* empty (outline) as base */}
                        <FontAwesome name="star-o" size={size} color={emptyColor} />

                        {/* overlay filled part */}
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
                                <FontAwesome name="star" size={size} color={color} />
                            </View>
                        )}
                    </View>
                )

                if (readonly) return <View key={starIndex}>{StarIcon}</View>

                return (
                    <AppPressable key={starIndex} onPress={() => handlePress(starIndex)}>
                        {StarIcon}
                    </AppPressable>
                )
            })}
        </View>
    )
}
