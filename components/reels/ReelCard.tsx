import React from 'react'
import { Image, View, ViewStyle } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import type { ReelFeedItem } from '@/store/features/reels/reels.types'

const cardShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

export function ReelCard({ reel }: { reel: ReelFeedItem }) {
    const router = useRouter()
    const { business } = reel

    const initial = business.name.charAt(0).toUpperCase()

    return (
        <AppPressable onPress={() => router.push(`/(protected)/user/reel/${reel.id}?videoUrl=${encodeURIComponent(reel.videoUrl)}`)}>
            <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
                {/* Row 1: Avatar + Name + Category */}
                <View className="mb-2 flex-row items-center">
                    <View className="mr-3">
                        <Avatar
                            uri={business.logoUrl ?? undefined}
                            size={56}
                            borderWidth={2}
                            borderColor="#E8A230"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#A3C9A8]">
                                    <AppText className="text-title font-poppins-bold text-white">{initial}</AppText>
                                </View>
                            }
                        />
                    </View>

                    <View className="flex-1">
                        <AppText className="text-lg font-poppins-semibold text-text">{business.name}</AppText>

                        {/* Rating + City */}
                        <View className="mt-0.5 flex-row items-center gap-1">
                            <FontAwesome name="star" size={14} color="#E8A230" />
                            <AppText className="text-status text-text">({business.ratingAvg})</AppText>
                            <Feather name="map-pin" size={13} color="#e89f48" />
                            <AppText className="text-status text-text">{business.city}</AppText>
                        </View>
                    </View>
                </View>

                {/* Row 2: Video thumbnail with play overlay */}
                <View className="mt-1 overflow-hidden rounded-xl" style={{ height: 160 }}>
                    <Image source={{ uri: reel.videoUrl }} className="h-full w-full" resizeMode="cover" style={{ backgroundColor: '#D9D9D9' }} />
                    <View className="absolute inset-0 items-center justify-center">
                        <View className="items-center justify-center rounded-full bg-black/40" style={{ width: 48, height: 48 }}>
                            <Feather name="play" size={24} color="#fff" />
                        </View>
                    </View>
                </View>
            </View>
        </AppPressable>
    )
}
