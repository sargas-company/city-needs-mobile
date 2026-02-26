import React, { memo, useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, ImageSourcePropType, ListRenderItem, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import { AnalyticsSource } from '@/hooks/useTrackAnalytics'
import type { BusinessCardDto } from '@/store/features/search/search.types'

// Category card images
import FoodImage from '@/assets/images/home-page/food.png'
import BeautyImage from '@/assets/images/home-page/beauty.png'
import RepairsImage from '@/assets/images/home-page/repairs.png'
import PetsImage from '@/assets/images/home-page/pets.png'
import NoDataImage from '@/assets/images/system/NoData.svg'

type CategoryCardProps = {
    title: string
    emoji: string
    image: ImageSourcePropType
    bgColor: string
    onPress?: () => void
}

const CategoryCard = memo(function CategoryCard({ title, emoji, image, bgColor, onPress }: CategoryCardProps) {
    return (
        <AppPressable onPress={onPress} className="flex-1 overflow-hidden rounded-xl" style={{ backgroundColor: bgColor, height: 100 }}>
            <View className="flex-1 flex-row items-end p-3 gap-2">
                <AppText className="text-lg">{emoji}</AppText>
                <AppText className="text-[16px] font-poppins-semibold text-white">{title}</AppText>
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <Image source={image} style={{ width: 100, height: 100 }} />
            </View>
        </AppPressable>
    )
})

// Visual config for category cards - matched by slug from API
const CATEGORY_DISPLAY_CONFIG: Record<string, { title: string; emoji: string; image: ImageSourcePropType; bgColor: string }> = {
    'beauty-wellness': { title: 'Beauty', emoji: '💄', image: BeautyImage, bgColor: '#dfbaf4' },
    'pet-care': { title: 'Pets', emoji: '🐶', image: PetsImage, bgColor: '#D8CFC8' },
    'home-repairs': { title: 'Repairs', emoji: '🔧', image: RepairsImage, bgColor: '#F4B778' },
    cleaning: { title: 'Cleaning', emoji: '🧹', image: RepairsImage, bgColor: '#A3C9A8' },
    'delivery-assistance': { title: 'Delivery', emoji: '🚚', image: FoodImage, bgColor: '#F5A3A8' },
    other: { title: 'Other', emoji: '📦', image: FoodImage, bgColor: '#B8C5D6' },
}

// Default display for categories without specific config
const DEFAULT_CATEGORY_DISPLAY = { title: 'Other', emoji: '📋', image: FoodImage, bgColor: '#B8C5D6' }

// Horizontal business card for sections
const HorizontalBusinessCard = memo(function HorizontalBusinessCard({ business }: { business: BusinessCardDto }) {
    return (
        <View style={{ width: 345 }}>
            <ServiceCard business={business} analyticsSource={AnalyticsSource.CATEGORIES} />
        </View>
    )
})

// Section types for FlatList
type SectionItem =
    | { type: 'header' }
    | { type: 'categories' }
    | { type: 'top-picks' }
    | { type: 'section'; key: string; title: string; businesses: BusinessCardDto[]; isLoading: boolean }

const keyExtractor = (item: SectionItem, index: number) => {
    if (item.type === 'section') return `section-${item.key}`
    return `${item.type}-${index}`
}

// Horizontal FlatList for business cards in a section
const HorizontalBusinessList = memo(function HorizontalBusinessList({
    businesses,
    isLoading,
}: {
    businesses: BusinessCardDto[]
    isLoading: boolean
}) {
    const renderItem = useCallback(({ item }: { item: BusinessCardDto }) => <HorizontalBusinessCard business={item} />, [])
    const businessKeyExtractor = useCallback((item: BusinessCardDto) => item.id, [])

    if (isLoading) {
        return (
            <View className="items-center py-10">
                <ActivityIndicator size="small" />
            </View>
        )
    }

    if (businesses.length === 0) {
        return (
            <View className="items-center py-6">
                <NoDataImage width={100} height={100} />
                <AppText className="mt-2 text-base font-poppins-semibold text-gray-400">No businesses found</AppText>
            </View>
        )
    }

    return (
        <FlatList
            horizontal
            data={businesses}
            keyExtractor={businessKeyExtractor}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8, gap: 12 }}
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={false}
            getItemLayout={(_, index) => ({ length: 332, offset: 332 * index, index })}
        />
    )
})

export default function HomeScreen() {
    const router = useRouter()
    const { location } = useEnsureLocation()

    const { data: categories = [] } = useGetCategoriesQuery()

    // Map API categories to display cards (first 4 for grid)
    const displayCategories = useMemo(() => {
        return categories.slice(0, 4).map((cat) => ({
            ...cat,
            display: CATEGORY_DISPLAY_CONFIG[cat.slug] ?? DEFAULT_CATEGORY_DISPLAY,
        }))
    }, [categories])

    const handleCategoryPress = useCallback(
        (slug: string) => {
            router.push({ pathname: '/(protected)/user/(tabs)/search', params: { categorySlug: slug } })
        },
        [router]
    )

    const handleSeeAllPress = useCallback(() => {
        router.push({ pathname: '/(protected)/user/(tabs)/search', params: { categorySlug: '' } })
    }, [router])

    // Search bar state
    const [searchText, setSearchText] = useState('')

    const handleSearchSubmit = useCallback(() => {
        if (searchText.trim()) {
            router.push({ pathname: '/(protected)/user/(tabs)/search', params: { query: searchText.trim(), categorySlug: '' } })
            setSearchText('')
        }
    }, [router, searchText])

    // Only load first 2 sections initially, others load when visible
    const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set(['suggested', 'nearby']))

    // Suggested for you - top rated (loads immediately)
    const {
        data: suggestedData,
        isLoading: suggestedLoading,
        isFetching: _suggestedFetching,
        refetch: refetchSuggested,
    } = useSearchBusinessesQuery({
        sort: 'top_rated',
        limit: 5, // Reduced limit for performance
    })

    // Near you - nearby (requires location, loads immediately)
    const {
        data: nearbyData,
        isLoading: nearbyLoading,
        refetch: refetchNearby,
    } = useSearchBusinessesQuery(
        {
            sort: 'nearby',
            limit: 5,
            lat: location?.lat,
            lng: location?.lng,
        },
        { skip: !location }
    )

    // Trending this week - popular (lazy loaded)
    const {
        data: trendingData,
        isLoading: trendingLoading,
        refetch: refetchTrending,
    } = useSearchBusinessesQuery(
        {
            sort: 'popular',
            limit: 5,
        },
        { skip: !loadedSections.has('trending') }
    )

    // New on City Needs (lazy loaded)
    const {
        data: newData,
        isLoading: newLoading,
        refetch: refetchNew,
    } = useSearchBusinessesQuery(
        {
            sort: 'popular',
            limit: 5,
        },
        { skip: !loadedSections.has('new') }
    )

    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await Promise.all([
            refetchSuggested(),
            location ? refetchNearby() : Promise.resolve(),
            loadedSections.has('trending') ? refetchTrending() : Promise.resolve(),
            loadedSections.has('new') ? refetchNew() : Promise.resolve(),
        ])
        setIsRefreshing(false)
    }, [refetchSuggested, refetchNearby, refetchTrending, refetchNew, location, loadedSections])

    const suggestedBusinesses = useMemo(() => suggestedData?.data ?? [], [suggestedData])
    const nearbyBusinesses = useMemo(() => nearbyData?.data ?? [], [nearbyData])
    const trendingBusinesses = useMemo(() => trendingData?.data ?? [], [trendingData])
    const newBusinesses = useMemo(() => newData?.data ?? [], [newData])

    // Build section data for FlatList
    const sections = useMemo<SectionItem[]>(
        () => [
            { type: 'header' },
            { type: 'categories' },
            { type: 'top-picks' },
            // { type: 'section', key: 'suggested', title: 'Suggested For You', businesses: suggestedBusinesses, isLoading: suggestedLoading },
            { type: 'section', key: 'nearby', title: 'Near You', businesses: nearbyBusinesses, isLoading: nearbyLoading || !location },
            // {
            //     type: 'section',
            //     key: 'trending',
            //     title: 'Trending This Week',
            //     businesses: trendingBusinesses,
            //     isLoading: trendingLoading || !loadedSections.has('trending'),
            // },
            // {
            //     type: 'section',
            //     key: 'new',
            //     title: 'New on City Needs',
            //     businesses: newBusinesses,
            //     isLoading: newLoading || !loadedSections.has('new'),
            // },
        ],
        [
            suggestedBusinesses,
            suggestedLoading,
            nearbyBusinesses,
            nearbyLoading,
            location,
            trendingBusinesses,
            trendingLoading,
            newBusinesses,
            newLoading,
            loadedSections,
        ]
    )

    // Track which sections become visible
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: { item: SectionItem }[] }) => {
        const visibleSectionKeys = viewableItems.filter((v) => v.item.type === 'section').map((v) => (v.item as { type: 'section'; key: string }).key)

        setLoadedSections((prev) => {
            const next = new Set(prev)
            let changed = false
            for (const key of visibleSectionKeys) {
                if (!prev.has(key)) {
                    next.add(key)
                    changed = true
                }
            }
            return changed ? next : prev
        })
    }, [])

    const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 10, minimumViewTime: 100 }), [])

    const refreshControl = useMemo(
        () => <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0C2A63" />,
        [isRefreshing, handleRefresh]
    )

    const renderItem: ListRenderItem<SectionItem> = useCallback(
        ({ item }) => {
            switch (item.type) {
                case 'header':
                    return (
                        <View className="mb-6 px-screen">
                            {/* ── Location row ─────────────────────────── */}
                            <View className="mb-3 flex-row items-center justify-between">
                                <View>
                                    <AppText className="mb-1 text-[12px] text-text-muted">Location</AppText>
                                    <View className="flex-row items-center gap-2">
                                        <Feather name="map-pin" size={16} color="#e89f48" />
                                        <AppText className="font-poppins-medium text-subtitle text-brand">All Cities</AppText>
                                    </View>
                                </View>
                            </View>

                            <AppInput
                                leftIcon={<Feather name="search" size={18} color="#8D8C92" />}
                                clearable
                                value={searchText}
                                onChangeText={setSearchText}
                                onSubmitEditing={handleSearchSubmit}
                                returnKeyType="search"
                                placeholder="Search services..."
                            />
                        </View>
                    )

                case 'categories':
                    return (
                        <View className="mb-6 px-screen">
                            <View className="mb-3 flex-row items-end justify-between">
                                <AppText className="flex-1 shrink font-poppins-semibold text-[24px] text-brand">What service do you need?</AppText>

                                <AppPressable onPress={handleSeeAllPress} className="ml-3 shrink-0">
                                    <AppText className="text-status font-poppins-medium text-brand">See All</AppText>
                                </AppPressable>
                            </View>

                            <View className="gap-3">
                                <View className="flex-row gap-3">
                                    {displayCategories[0] && (
                                        <CategoryCard
                                            title={displayCategories[0].display.title}
                                            emoji={displayCategories[0].display.emoji}
                                            image={displayCategories[0].display.image}
                                            bgColor={displayCategories[0].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[0].slug)}
                                        />
                                    )}
                                    {displayCategories[1] && (
                                        <CategoryCard
                                            title={displayCategories[1].display.title}
                                            emoji={displayCategories[1].display.emoji}
                                            image={displayCategories[1].display.image}
                                            bgColor={displayCategories[1].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[1].slug)}
                                        />
                                    )}
                                </View>
                                <View className="flex-row gap-3">
                                    {displayCategories[2] && (
                                        <CategoryCard
                                            title={displayCategories[2].display.title}
                                            emoji={displayCategories[2].display.emoji}
                                            image={displayCategories[2].display.image}
                                            bgColor={displayCategories[2].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[2].slug)}
                                        />
                                    )}
                                    {displayCategories[3] && (
                                        <CategoryCard
                                            title={displayCategories[3].display.title}
                                            emoji={displayCategories[3].display.emoji}
                                            image={displayCategories[3].display.image}
                                            bgColor={displayCategories[3].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[3].slug)}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    )

                case 'top-picks':
                    return (
                        <View className="mb-6 px-screen">
                            <View className="mb-3 flex-row items-end justify-between">
                                <AppText className="flex-1 shrink font-poppins-semibold text-[24px] text-brand">Top Picks Today</AppText>

                                <AppPressable onPress={handleSeeAllPress} className="ml-3 shrink-0">
                                    <AppText className="text-status font-poppins-medium text-brand">See All</AppText>
                                </AppPressable>
                            </View>
                            <View className="gap-3">
                                <View className="flex-row gap-3">
                                    {displayCategories[3] && (
                                        <CategoryCard
                                            title={displayCategories[3].display.title}
                                            emoji={displayCategories[3].display.emoji}
                                            image={displayCategories[3].display.image}
                                            bgColor={displayCategories[3].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[3].slug)}
                                        />
                                    )}
                                    {displayCategories[1] && (
                                        <CategoryCard
                                            title={displayCategories[1].display.title}
                                            emoji={displayCategories[1].display.emoji}
                                            image={displayCategories[1].display.image}
                                            bgColor={displayCategories[1].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[1].slug)}
                                        />
                                    )}
                                </View>
                                <View className="flex-row gap-3">
                                    {displayCategories[2] && (
                                        <CategoryCard
                                            title={displayCategories[2].display.title}
                                            emoji={displayCategories[2].display.emoji}
                                            image={displayCategories[2].display.image}
                                            bgColor={displayCategories[2].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[2].slug)}
                                        />
                                    )}
                                    {displayCategories[0] && (
                                        <CategoryCard
                                            title={displayCategories[0].display.title}
                                            emoji={displayCategories[0].display.emoji}
                                            image={displayCategories[0].display.image}
                                            bgColor={displayCategories[0].display.bgColor}
                                            onPress={() => handleCategoryPress(displayCategories[0].slug)}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    )

                case 'section':
                    return (
                        <View className="mb-6">
                            <View className="mb-3 flex-row items-end justify-between px-screen">
                                <AppText className="flex-1 shrink font-poppins-semibold text-[24px] text-brand">{item.title}</AppText>

                                <AppPressable onPress={handleSeeAllPress} className="ml-3 shrink-0">
                                    <AppText className="text-status font-poppins-medium text-brand">See All</AppText>
                                </AppPressable>
                            </View>
                            <HorizontalBusinessList businesses={item.businesses} isLoading={item.isLoading} />
                        </View>
                    )

                default:
                    return null
            }
        },
        [handleCategoryPress, handleSeeAllPress, handleSearchSubmit, displayCategories, searchText]
    )

    return (
        <SafeAreaView className="flex-1 bg-white">
            <WaveHeader />

            <FlatList
                data={sections}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingBottom: 20 }}
                initialNumToRender={4}
                maxToRenderPerBatch={2}
                windowSize={5}
                removeClippedSubviews={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                refreshControl={refreshControl}
            />
        </SafeAreaView>
    )
}
