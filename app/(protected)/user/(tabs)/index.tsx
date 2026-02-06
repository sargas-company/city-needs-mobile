import React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import type { BusinessCardDto } from '@/store/features/search/search.types'

type HomeSectionProps = {
    title: string
    businesses: BusinessCardDto[]
    isLoading: boolean
}

function HomeSection({ title, businesses, isLoading }: HomeSectionProps) {
    return (
        <View className="mb-6">
            {/* Section header */}
            <View className="mb-3 flex-row items-center justify-between px-screen">
                <AppText className="text-title font-poppins-bold text-brand">{title}</AppText>
                <AppPressable>
                    <AppText className="text-status font-poppins-medium text-orange">See All</AppText>
                </AppPressable>
            </View>

            {/* Horizontal scroll */}
            {isLoading ? (
                <View className="items-center py-10">
                    <ActivityIndicator size="small" />
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    {businesses.map((business) => (
                        <View key={business.id} style={{ width: 320 }}>
                            <ServiceCard business={business} />
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

export default function HomeScreen() {
    const { location } = useEnsureLocation()

    // Suggested for you - top rated
    const { data: suggestedData, isLoading: suggestedLoading } = useSearchBusinessesQuery({
        sort: 'top_rated',
        limit: 10,
    })

    // Near you - nearby (requires location)
    const { data: nearbyData, isLoading: nearbyLoading } = useSearchBusinessesQuery(
        {
            sort: 'nearby',
            limit: 10,
            lat: location?.lat,
            lng: location?.lng,
        },
        { skip: !location }
    )

    // Trending this week - popular
    const { data: trendingData, isLoading: trendingLoading } = useSearchBusinessesQuery({
        sort: 'popular',
        limit: 10,
    })

    // New on City Needs - price ascending as a stand-in (ideally would be sorted by created_at)
    const { data: newData, isLoading: newLoading } = useSearchBusinessesQuery({
        sort: 'popular',
        limit: 10,
    })

    const suggestedBusinesses = suggestedData?.data ?? []
    const nearbyBusinesses = nearbyData?.data ?? []
    const trendingBusinesses = trendingData?.data ?? []
    const newBusinesses = newData?.data ?? []

    return (
        <View className="flex-1 bg-white">
            <WaveHeader />

            <SafeAreaView className="flex-1" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <HomeSection title="Suggested For You" businesses={suggestedBusinesses} isLoading={suggestedLoading} />

                    <HomeSection title="Near You" businesses={nearbyBusinesses} isLoading={nearbyLoading || !location} />

                    <HomeSection title="Trending This Week" businesses={trendingBusinesses} isLoading={trendingLoading} />

                    <HomeSection title="New on City Needs" businesses={newBusinesses} isLoading={newLoading} />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
