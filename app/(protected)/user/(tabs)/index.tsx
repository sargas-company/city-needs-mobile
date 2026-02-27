import React, { memo, useCallback, useMemo, useState } from 'react'
import { FlatList, Image, ListRenderItem, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppLoader } from '@/components/ui/AppLoader'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import { AnalyticsSource } from '@/hooks/useTrackAnalytics'
import { selectSelectedCity } from '@/store/features/location/location.selectors'
import { useAppSelector } from '@/store/hooks'
import type { BusinessCardDto } from '@/store/features/search/search.types'
import MapMarkerIcon from '@/assets/images/map-marker.svg'

// Default background color when category has no bgColor
const DEFAULT_BG_COLOR = '#B8C5D6'

// Slugs for "What service do you need?" section
const MAIN_CATEGORY_SLUGS = ['mortgage-brokers', 'event-planners', 'tiffin-services', 'cleaning']

// Slugs for "Top Picks Today" section
const TOP_PICKS_SLUGS = ['cleaning', 'pet-care', 'home-repairs', 'beauty-wellness']

type CategoryCardProps = {
    title: string
    imageUrl: string | null
    bgColor: string
    onPress?: () => void
}

const CategoryCard = memo(function CategoryCard({ title, imageUrl, bgColor, onPress }: CategoryCardProps) {
    return (
        <AppPressable onPress={onPress} className="flex-1 overflow-hidden rounded-xl" style={{ backgroundColor: bgColor, height: 100 }}>
            <View className="flex-1 justify-end p-3 pr-24">
                <AppText className="text-[15px] font-poppins-semibold text-white" numberOfLines={2}>
                    {title}
                </AppText>
            </View>
            {imageUrl && (
                <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                    <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100 }} />
                </View>
            )}
        </AppPressable>
    )
})

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
                <AppLoader size="xs" showTitle />
            </View>
        )
    }

    if (businesses.length === 0) {
        return <EmptyState text="No businesses found" />
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
    const selectedCity = useAppSelector(selectSelectedCity)

    const { data: categories = [] } = useGetCategoriesQuery()

    const getCategoryBySlug = useCallback((slug: string) => categories.find((cat) => cat.slug === slug), [categories])

    const handleCategoryPress = useCallback(
        (slug: string) => {
            router.push({ pathname: '/(protected)/user/(tabs)/search', params: { categorySlug: slug } })
        },
        [router]
    )

    const handleSeeAllPress = useCallback(() => {
        router.push({ pathname: '/(protected)/user/(tabs)/search', params: { categorySlug: '' } })
    }, [router])

    const handleNearYouSeeAllPress = useCallback(() => {
        router.push({
            pathname: '/(protected)/user/(tabs)/search',
            params: {
                sort: 'nearby',
                lat: location?.lat?.toString() ?? '',
                lng: location?.lng?.toString() ?? '',
                withinKm: 5,
            },
        })
    }, [router, location])

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

    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await Promise.all([location ? refetchNearby() : Promise.resolve(), loadedSections.has('trending') ? refetchTrending() : Promise.resolve()])
        setIsRefreshing(false)
    }, [refetchNearby, refetchTrending, location, loadedSections])

    const nearbyBusinesses = useMemo(() => nearbyData?.data ?? [], [nearbyData])

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
        [nearbyBusinesses, nearbyLoading, location, trendingLoading, loadedSections]
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
                            <View className="mb-6 flex-row items-center justify-between">
                                <View>
                                    <AppText className="text-[12px] text-text-muted mb-3">Location</AppText>
                                    <View className="flex-row items-center gap-3.5">
                                        <MapMarkerIcon width={24} height={24} />
                                        <AppText className="font-poppins-medium text-subtitle text-brand">{selectedCity ?? 'All Cities'}</AppText>

                                        <Feather name="chevron-down" size={20} color="#e89f48" className={'mt-1'} />
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
                                    {MAIN_CATEGORY_SLUGS.slice(0, 2).map((slug) => {
                                        const cat = getCategoryBySlug(slug)
                                        if (!cat) return null
                                        return (
                                            <CategoryCard
                                                key={cat.id}
                                                title={cat.title}
                                                imageUrl={cat.imageUrl}
                                                bgColor={cat.bgColor ?? DEFAULT_BG_COLOR}
                                                onPress={() => handleCategoryPress(cat.slug)}
                                            />
                                        )
                                    })}
                                </View>
                                <View className="flex-row gap-3">
                                    {MAIN_CATEGORY_SLUGS.slice(2, 4).map((slug) => {
                                        const cat = getCategoryBySlug(slug)
                                        if (!cat) return null
                                        return (
                                            <CategoryCard
                                                key={cat.id}
                                                title={cat.title}
                                                imageUrl={cat.imageUrl}
                                                bgColor={cat.bgColor ?? DEFAULT_BG_COLOR}
                                                onPress={() => handleCategoryPress(cat.slug)}
                                            />
                                        )
                                    })}
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
                                    {TOP_PICKS_SLUGS.slice(0, 2).map((slug) => {
                                        const cat = getCategoryBySlug(slug)
                                        if (!cat) return null
                                        return (
                                            <CategoryCard
                                                key={cat.id}
                                                title={cat.title}
                                                imageUrl={cat.imageUrl}
                                                bgColor={cat.bgColor ?? DEFAULT_BG_COLOR}
                                                onPress={() => handleCategoryPress(cat.slug)}
                                            />
                                        )
                                    })}
                                </View>
                                <View className="flex-row gap-3">
                                    {TOP_PICKS_SLUGS.slice(2, 4).map((slug) => {
                                        const cat = getCategoryBySlug(slug)
                                        if (!cat) return null
                                        return (
                                            <CategoryCard
                                                key={cat.id}
                                                title={cat.title}
                                                imageUrl={cat.imageUrl}
                                                bgColor={cat.bgColor ?? DEFAULT_BG_COLOR}
                                                onPress={() => handleCategoryPress(cat.slug)}
                                            />
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                    )

                case 'section':
                    return (
                        <View className="mb-6">
                            <View className="mb-3 flex-row items-end justify-between px-screen">
                                <AppText className="flex-1 shrink font-poppins-semibold text-[24px] text-brand">{item.title}</AppText>

                                <AppPressable
                                    onPress={item.key === 'nearby' ? handleNearYouSeeAllPress : handleSeeAllPress}
                                    className="ml-3 shrink-0"
                                >
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
        [handleCategoryPress, handleSeeAllPress, handleNearYouSeeAllPress, handleSearchSubmit, getCategoryBySlug, searchText, selectedCity]
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
