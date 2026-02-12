import React from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { DoubleStar } from '@/components/ui/DoubleMoon'
import type { BusinessCardDto } from '@/store/features/search/search.types'

const cardShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
}

export interface BusinessMapCardProps {
    business: BusinessCardDto
    onClose?: () => void
}

/**
 * Compact business card for map overlay.
 * Shows: name, rating, category, city, Call/Chat actions.
 */
export function BusinessMapCard({ business, onClose }: BusinessMapCardProps) {
    const router = useRouter()
    const initial = business.name.charAt(0).toUpperCase()

    const handlePress = () => {
        router.push(`/(protected)/user/book/${business.id}`)
    }

    return (
        <Pressable onPress={handlePress} className="overflow-hidden rounded-2xl bg-white px-4 py-3" style={cardShadow}>
            {onClose && (
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation()
                        onClose()
                    }}
                    hitSlop={8}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1"
                    style={cardShadow}
                >
                    <Feather name="x" size={18} color="#8D8C92" />
                </Pressable>
            )}
            <View className="flex-row items-start">
                {/* Logo / Initial */}
                {business.logoUrl ? (
                    <Image
                        source={{ uri: business.logoUrl }}
                        className="mr-3 rounded-xl"
                        style={{ width: 48, height: 48 }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                    />
                ) : (
                    <View className="mr-3 items-center justify-center rounded-xl bg-brand" style={{ width: 48, height: 48 }}>
                        <AppText className="text-title font-poppins-bold text-white">{initial}</AppText>
                    </View>
                )}

                {/* Content */}
                <View className="flex-1">
                    <AppText className="text-subtitle font-poppins-semibold text-text">{business.name}</AppText>

                    {/* Rating */}
                    <View className="mt-1 flex-row items-center gap-1">
                        <DoubleStar />
                        <AppText className="text-status text-text">
                            {business.ratingAvg.toFixed(1)} · {business.ratingCount} reviews
                        </AppText>
                    </View>

                    {/* Category + City */}
                    <View className="mt-2 flex-row flex-wrap items-center gap-2">
                        <View className="rounded-pill bg-orange px-2.5 py-1">
                            <AppText className="text-xs font-poppins-medium text-white">{business.category.title}</AppText>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Feather name="map-pin" size={12} color="#e89f48" />
                            <AppText className="text-status text-text-muted">{business.city}</AppText>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="mt-3 flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                            <Feather name="phone" size={14} color="#0C2A63" />
                            <AppText className="text-status font-poppins-medium text-text">Call</AppText>
                        </View>
                        <AppText className="text-status text-text-muted">·</AppText>
                        <View className="flex-row items-center gap-1">
                            <Feather name="message-circle" size={14} color="#0C2A63" />
                            <AppText className="text-status font-poppins-medium text-text">Chat</AppText>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}
