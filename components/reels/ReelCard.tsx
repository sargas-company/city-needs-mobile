import React, { memo, useCallback } from 'react'
import { View, ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { DoubleStar } from '@/components/ui/DoubleMoon'
import type { ReelFeedItem } from '@/store/features/reels/reels.types'
import MapMarkerIcon from '@/assets/images/map-marker.svg'
import PlayButtonIcon from '@/assets/images/play-button.svg'

const cardShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

type ReelCardProps = {
    reel: ReelFeedItem
}

export const ReelCard = memo(function ReelCard({ reel }: ReelCardProps) {
    const router = useRouter()
    const { business } = reel

    const initial = business.name.charAt(0).toUpperCase()

    const handleBusinessPress = useCallback(() => {
        router.push(`/(protected)/user/book/${business.id}`)
    }, [router, business.id])

    const handleVideoPress = useCallback(() => {
        router.push(`/(protected)/user/reel/${reel.id}?videoUrl=${encodeURIComponent(reel.videoUrl)}`)
    }, [router, reel.id, reel.videoUrl])

    return (
        <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
            {/* Row 1: Avatar + Name + Category - navigates to business */}
            <AppPressable onPress={handleBusinessPress} className="mb-2 flex-row items-center">
                <View className="mr-3">
                    <Avatar
                        uri={business.logoUrl ?? undefined}
                        size={65}
                        borderWidth={2}
                        borderColor="#E8A230"
                        recyclingKey={`reel-avatar-${reel.id}`}
                        fallback={
                            <View className="flex-1 items-center justify-center bg-[#A3C9A8]">
                                <AppText className="text-title font-poppins-bold text-white">{initial}</AppText>
                            </View>
                        }
                    />
                </View>

                <View className="flex-1">
                    <AppText className="text-lg font-poppins-semibold text-brand">{business.name}</AppText>

                    {/* Rating + City */}
                    <View className="mt-0.5 flex-row items-center gap-1">
                        <DoubleStar />
                        <AppText className="text-status text-text mr-2">({business.ratingAvg.toFixed(1)})</AppText>
                        <MapMarkerIcon width={22} height={22} />
                        <AppText className="text-status text-text">{business.address.city}</AppText>
                    </View>
                </View>
            </AppPressable>

            {/* Row 2: Thumbnail - navigates to reel player */}
            <AppPressable onPress={handleVideoPress} className="mt-1 overflow-hidden rounded-xl" style={{ height: 160 }}>
                <Image
                    source={{ uri: reel.thumbnailUrl }}
                    style={{ width: '33%', height: '100%', borderRadius: 12 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                />
                <View className="absolute inset-0 items-center justify-center" style={{ width: '33%' }}>
                    <PlayButtonIcon width={50} height={50} />
                </View>
            </AppPressable>
        </View>
    )
})
