import { View } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'

export type AvatarProps = {
    uri?: string
    size?: number
    borderWidth?: number
    borderColor?: string
    fallback?: React.ReactNode
    /**
     * Optional key for image recycling in lists.
     * Pass a unique identifier (e.g., user ID) when Avatar is used in FlatList/ScrollView.
     */
    recyclingKey?: string
}

export const Avatar = ({ uri, size = 73, borderWidth = 3, borderColor = '#FFFFFF', fallback, recyclingKey }: AvatarProps) => {
    const radius = size / 2
    // Calculate inner image size for optimal memory usage
    const innerSize = size - borderWidth * 2

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                backgroundColor: borderColor,
                padding: borderWidth,

                // shadow (iOS)
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 1 },
                shadowOpacity: 0.48,
                shadowRadius: 4,

                // shadow (Android)
                elevation: 6,
            }}
        >
            <View
                style={{
                    flex: 1,
                    borderRadius: radius - borderWidth,
                    overflow: 'hidden',
                    backgroundColor: '#E5E7EB',
                }}
            >
                {uri ? (
                    <Image
                        source={{ uri }}
                        style={{ width: innerSize, height: innerSize }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                        recyclingKey={recyclingKey}
                    />
                ) : (
                    fallback
                )}
            </View>
        </View>
    )
}
