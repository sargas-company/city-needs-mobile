import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SvgProps } from 'react-native-svg'
import Feather from '@expo/vector-icons/Feather'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { MapSearchBar } from '@/src/features/map/components/MapSearchBar'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import type { BusinessCardDto } from '@/store/features/search/search.types'

// Category card images
import FoodImage from '@/assets/images/home-page/food.svg'
import BeautyImage from '@/assets/images/home-page/beauty.svg'
import RepairsImage from '@/assets/images/home-page/repairs.svg'
import PetsImage from '@/assets/images/home-page/pets.svg'
import NoDataImage from '@/assets/images/system/NoData.svg'

type CategoryCardProps = {
    title: string
    emoji: string
    Image: React.FC<SvgProps>
    bgColor: string
}

function CategoryCard({ title, emoji, Image, bgColor }: CategoryCardProps) {
    return (
        <AppPressable className="flex-1 overflow-hidden rounded-2xl" style={{ backgroundColor: bgColor, height: 100 }}>
            <View className="flex-1 flex-row items-end p-3">
                <AppText className="text-lg">{emoji}</AppText>
                <AppText className="text-subtitle font-poppins-semibold text-white">{title}</AppText>
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <Image width={80} height={80} />
            </View>
        </AppPressable>
    )
}

const CATEGORIES = [
    { title: 'Food', emoji: '🍔', Image: FoodImage, bgColor: '#F5A3A8' },
    { title: 'Beauty', emoji: '💄', Image: BeautyImage, bgColor: '#F4F2BA' },
    { title: 'Repairs', emoji: '🔧', Image: RepairsImage, bgColor: '#F4B778' },
    { title: 'Pets', emoji: '🐶', Image: PetsImage, bgColor: '#D8CFC8' },
]

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
                <AppText className="text-xl font-poppins-semibold text-brand">{title}</AppText>
                <AppPressable>
                    <AppText className="text-status font-poppins-medium text-orange">See All</AppText>
                </AppPressable>
            </View>

            {/* Horizontal scroll */}
            {isLoading ? (
                <View className="items-center py-10">
                    <ActivityIndicator size="small" />
                </View>
            ) : businesses.length === 0 ? (
                <View className="items-center py-6">
                    <NoDataImage width={80} height={80} />
                    <AppText className="mt-2 text-base font-poppins-semibold text-gray-400">No businesses found</AppText>
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
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

    const { data: categories } = useGetCategoriesQuery()

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
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Search bar */}
                    <View className="mb-4">
                        <MapSearchBar value="" onChangeText={() => {}} />
                    </View>

                    {/* Category chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                    >
                        <AppPressable
                            onPress={() => setSelectedCategoryId(null)}
                            className={
                                selectedCategoryId === null
                                    ? 'flex-row items-center gap-1 rounded-2xl bg-orange px-3 py-2'
                                    : 'flex-row items-center rounded-2xl border border-border bg-white px-3 py-2'
                            }
                        >
                            <AppText
                                className={
                                    selectedCategoryId === null
                                        ? 'text-status font-poppins-medium text-white'
                                        : 'text-status font-poppins-medium text-text'
                                }
                            >
                                All
                            </AppText>
                        </AppPressable>

                        {categories?.map((cat) => {
                            const active = selectedCategoryId === cat.id
                            return (
                                <AppPressable
                                    key={cat.id}
                                    onPress={() => setSelectedCategoryId(active ? null : cat.id)}
                                    className={
                                        active
                                            ? 'flex-row items-center gap-1 rounded-2xl bg-orange px-3 py-2'
                                            : 'flex-row items-center rounded-2xl border border-border bg-white px-3 py-2'
                                    }
                                >
                                    <AppText
                                        className={
                                            active ? 'text-status font-poppins-medium text-white' : 'text-status font-poppins-medium text-text'
                                        }
                                    >
                                        {cat.title}
                                    </AppText>
                                    {active && <Feather name="x" size={14} color="#fff" />}
                                </AppPressable>
                            )
                        })}
                    </ScrollView>

                    {/* Category cards section */}
                    <View className="mb-6 px-screen">
                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className="text-xl font-poppins-semibold text-brand">What service do you need?</AppText>
                            <AppPressable>
                                <AppText className="text-status font-poppins-medium text-orange">See All</AppText>
                            </AppPressable>
                        </View>
                        <View className="gap-3">
                            <View className="flex-row gap-3">
                                <CategoryCard {...CATEGORIES[0]} />
                                <CategoryCard {...CATEGORIES[1]} />
                            </View>
                            <View className="flex-row gap-3">
                                <CategoryCard {...CATEGORIES[2]} />
                                <CategoryCard {...CATEGORIES[3]} />
                            </View>
                        </View>
                    </View>

                    <View className="mb-6 px-screen">
                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className="text-xl font-poppins-semibold text-brand">Top Picks Today</AppText>
                            <AppPressable>
                                <AppText className="text-status font-poppins-medium text-orange">See All</AppText>
                            </AppPressable>
                        </View>
                        <View className="gap-3">
                            <View className="flex-row gap-3">
                                <CategoryCard {...CATEGORIES[3]} />
                                <CategoryCard {...CATEGORIES[1]} />
                            </View>
                            <View className="flex-row gap-3">
                                <CategoryCard {...CATEGORIES[2]} />
                                <CategoryCard {...CATEGORIES[0]} />
                            </View>
                        </View>
                    </View>

                    <HomeSection title="Suggested For You" businesses={suggestedBusinesses} isLoading={suggestedLoading} />

                    <HomeSection title="Near You" businesses={nearbyBusinesses} isLoading={nearbyLoading || !location} />

                    <HomeSection title="Trending This Week" businesses={trendingBusinesses} isLoading={trendingLoading} />

                    <HomeSection title="New on City Needs" businesses={newBusinesses} isLoading={newLoading} />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
