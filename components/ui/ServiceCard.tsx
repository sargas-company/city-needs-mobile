import React from 'react'
import { View, ViewStyle } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'

const cardShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

export interface ServiceCardProps {
    name: string
    category: string
    rating: number
    reviewCount: number
    location: string
    hours: string
    priceRange: string
    bookmarked: boolean
    avatarColor: string
    initial: string
}

export function ServiceCard({ service }: { service: ServiceCardProps }) {
    return (
        <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
            {/* Row 1: Avatar + Name + Category + Bookmark */}
            <View className="mb-2 flex-row items-center">
                <View className="mr-3 items-center justify-center rounded-xl" style={{ width: 56, height: 56, backgroundColor: service.avatarColor }}>
                    <AppText className="text-title font-poppins-bold text-white">{service.initial}.</AppText>
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <AppText className="text-subtitle font-poppins-bold text-text">{service.name}</AppText>
                        <View className="rounded-pill bg-orange px-3 py-0.5">
                            <AppText className="text-caption font-poppins-semibold text-white">{service.category}</AppText>
                        </View>
                    </View>

                    {/* Rating */}
                    <View className="mt-0.5 flex-row items-center gap-1">
                        <View className="h-3 w-3 rounded-full bg-[#F5C518]" />
                        <View className="h-3 w-3 rounded-full bg-brand" />
                        <AppText className="text-status text-text">({service.rating})</AppText>
                        <AppText className="text-status text-text-muted">{service.reviewCount} reviews</AppText>
                    </View>
                </View>

                <Feather name={service.bookmarked ? 'bookmark' : 'bookmark'} size={22} color="#0C2A63" />
            </View>

            {/* Row 3: Location | Hours | Fast replies */}
            <View className="mb-2 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={13} color="#e89f48" />
                    <AppText className="text-status text-text">{service.location}</AppText>
                </View>
                <AppText className="text-status text-border">|</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="clock" size={13} color="#8D8C92" />
                    <AppText className="text-status text-text">{service.hours}</AppText>
                </View>
                <AppText className="text-status text-border">|</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="zap" size={13} color="#e89f48" />
                    <AppText className="text-status text-text">Fast replies</AppText>
                </View>
            </View>

            {/* Row 4: Watch Reel · Call · Chat */}
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

            {/* Row 5: Thumbnails + Price */}
            <View className="flex-row items-center gap-3">
                <View className="flex-row items-center">
                    <View className="h-12 w-12 rounded-lg bg-[#D9D9D9]" />
                    <View className="-ml-2 h-12 w-12 rounded-lg bg-[#C4C4C4]" />
                    <View className="-ml-2 h-12 w-12 items-center justify-center rounded-lg bg-[#B0B0B0]">
                        <Feather name="eye" size={16} color="#fff" />
                    </View>
                </View>

                <View className="flex-row items-baseline">
                    <AppText className="text-subtitle font-poppins-bold text-orange">{service.priceRange}</AppText>
                    <AppText className="text-status text-text-muted">/months</AppText>
                </View>
            </View>
        </View>
    )
}
