import React, { memo, useCallback, useEffect, useState } from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'

import { AppText } from '@/components/ui/AppText'
import type { BusinessCardDto } from '@/store/features/search/search.types'
import { useAddSavedBusinessMutation, useRemoveSavedBusinessMutation } from '@/store/features/saved-businesses/savedBusinessesApi'
import { DoubleStar } from '@/components/ui/DoubleMoon'
import { AnalyticsSource, useTrackAnalytics } from '@/hooks/useTrackAnalytics'
import PeopleImage from '@/assets/images/people-reviews.png'

const cardShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

type ServiceCardProps = {
    business: BusinessCardDto
    analyticsSource: AnalyticsSource
}

export const ServiceCard = memo(function ServiceCard({ business, analyticsSource }: ServiceCardProps) {
    const router = useRouter()
    const [saved, setSaved] = useState(business.isSaved)
    const [addSaved] = useAddSavedBusinessMutation()
    const [removeSaved] = useRemoveSavedBusinessMutation()
    const { trackProfileView } = useTrackAnalytics()

    const handlePress = useCallback(() => {
        trackProfileView({ businessId: business.id, source: analyticsSource })
        router.push(`/(protected)/user/book/${business.id}`)
    }, [business.id, analyticsSource, trackProfileView, router])

    useEffect(() => {
        setSaved(business.isSaved)
    }, [business.isSaved])

    const handleBookmarkPress = useCallback(() => {
        setSaved((prev) => {
            if (prev) {
                removeSaved({ businessId: business.id })
            } else {
                addSaved({ businessId: business.id })
            }
            return !prev
        })
    }, [business.id, addSaved, removeSaved])

    const initial = business.name.charAt(0).toUpperCase()

    return (
        <Pressable onPress={handlePress}>
            <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
                {/* Row 1: Avatar + Name + Category + Bookmark */}
                <View className="mb-2 gap-3 flex-row items-center">
                    {business.logoUrl ? (
                        <Image
                            source={{ uri: business.logoUrl }}
                            recyclingKey={business.id}
                            className="mr-3"
                            style={{ width: 56, height: 56, borderRadius: 8 }}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={200}
                        />
                    ) : (
                        <View className="mr-3 items-center justify-center rounded-xl bg-[#A3C9A8]" style={{ width: 56, height: 56 }}>
                            <AppText className="text-title font-poppins-bold text-white">{initial}</AppText>
                        </View>
                    )}

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between gap-2">
                            <AppText className="shrink text-lg font-poppins-medium text-brand" numberOfLines={1}>
                                {business.name}
                            </AppText>
                            <View className="shrink-0 rounded-pill bg-orange px-2 py-0.5">
                                <AppText className="text-xs font-poppins-semibold text-white">{business.category.title}</AppText>
                            </View>
                        </View>

                        {/* Rating */}
                        <View className="mt-0.5 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1">
                                <DoubleStar />
                                <AppText className="text-status text-text">({business.ratingAvg})</AppText>
                                <AppText className="text-border">|</AppText>
                                <AppText className="text-status text-text">{business.ratingCount} reviews</AppText>
                            </View>

                            <Pressable onPress={handleBookmarkPress} hitSlop={8}>
                                <FontAwesome name="bookmark" size={20} color={saved ? '#0C2A63' : '#CBCBCB'} />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Row 2: Location | Service type */}
                <View className="mb-2 flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                        <Feather name="map-pin" size={13} color="#e89f48" />
                        <AppText className="text-status text-text">{business.city}</AppText>
                    </View>
                    {business.serviceInStudio && (
                        <>
                            <AppText className="text-status text-border">|</AppText>
                            <View className="flex-row items-center gap-1">
                                <Feather name="home" size={13} color="#8D8C92" />
                                <AppText className="text-status text-text">In Studio</AppText>
                            </View>
                        </>
                    )}
                    {business.serviceOnSite && (
                        <>
                            <AppText className="text-status text-border">|</AppText>
                            <View className="flex-row items-center gap-1">
                                <Feather name="truck" size={13} color="#8D8C92" />
                                <AppText className="text-status text-text">On Site</AppText>
                            </View>
                        </>
                    )}
                </View>

                {/* Row 3: Watch Reel · Call · Chat */}
                <View className="mb-3 flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1">
                        <Feather name="video" size={13} color="#0C2A63" />
                        <AppText className="text-status font-poppins-medium text-text">Watch Reel</AppText>
                    </View>
                    <AppText className="text-status text-text-muted">·</AppText>
                    <View className="flex-row items-center gap-1">
                        <Feather name="phone" size={13} color="#0C2A63" />
                        <AppText className="text-status font-poppins-medium text-text">Call</AppText>
                    </View>
                    <AppText className="text-status text-text-muted">·</AppText>
                    <View className="flex-row items-center gap-1">
                        <Feather name="message-circle" size={13} color="#0C2A63" />
                        <AppText className="text-status font-poppins-medium text-text">Chat</AppText>
                    </View>
                </View>

                {/* Row 4: Reviews + Price */}
                <View className="flex-row items-center gap-3">
                    <Image source={PeopleImage} style={{ width: 80, height: 24 }} />

                    <View className="flex-row items-baseline">
                        <AppText className="text-subtitle font-poppins-bold text-orange">${business.price}</AppText>
                    </View>
                </View>
            </View>
        </Pressable>
    )
})
