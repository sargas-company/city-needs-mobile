import { Image, View } from 'react-native'
import React from 'react'

export type AvatarProps = {
    uri?: string
    size?: number
    borderWidth?: number
    borderColor?: string
    fallback?: React.ReactNode
}
export const Avatar = ({ uri, size = 73, borderWidth = 3, borderColor = '#FFFFFF', fallback }: AvatarProps) => {
    const radius = size / 2

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
                    borderRadius: radius,
                    overflow: 'hidden',
                    backgroundColor: '#E5E7EB',
                }}
            >
                {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : fallback}
            </View>
        </View>
    )
}
