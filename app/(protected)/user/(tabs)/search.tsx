import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Modal, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

import MapMarkerIcon from '@/assets/images/map-marker.svg'
import { AppInput } from '@/components/ui/AppInput'
import { AppLoader } from '@/components/ui/AppLoader'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { FilterModal } from '@/components/filters/FilterModal'
import { filterValuesToSearchArgs, type FilterValues } from '@/components/filters/FilterModal.types'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import { AnalyticsSource } from '@/hooks/useTrackAnalytics'
import { setSelectedCity } from '@/store/features/location/location.slice'
import { selectSelectedCity } from '@/store/features/location/location.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { BusinessCardDto, BusinessSort, SearchBusinessesArgs } from '@/store/features/search/search.types'

// ── Filter chip config ──────────────────────────────────────────────────────────

type FilterChip = {
    id: string
    label: string
    getParams: () => Partial<SearchBusinessesArgs>
    /** If true, chip is only available when searching for services */
    requiresSearch?: boolean
}

const FILTER_CHIPS: FilterChip[] = [
    { id: 'open-now', label: 'Open Now', getParams: () => ({ openNow: true }) },
    { id: 'best-price', label: 'Best Price', getParams: () => ({ bestPrice: true }) },
]

const SORT_OPTIONS: { value: BusinessSort; label: string }[] = [
    { value: 'popular', label: 'Popular' },
    { value: 'top_rated', label: 'Top Rated' },
    { value: 'nearby', label: 'Nearby' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
]

const dropdownShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
}

// ── SearchScreen ───────────────────────────────────────────────────────────────

export default function SearchScreen() {
    const {
        categorySlug,
        query,
        sort: sortParam,
        lat: latParam,
        lng: lngParam,
        withinKm: withinKmParam,
    } = useLocalSearchParams<{
        categorySlug?: string
        query?: string
        sort?: BusinessSort
        lat?: string
        lng?: string
        withinKm?: string
    }>()
    const { data: categories = [] } = useGetCategoriesQuery()

    const [searchText, setSearchText] = useState('')

    // Apply search query from route params
    useEffect(() => {
        if (query) {
            setSearchText(query)
            setCursor(null)
        } else {
            setSearchText('')
        }
    }, [query])

    const debouncedSearchText = useDebounce(searchText, 300)
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
    const [sort, setSort] = useState<BusinessSort | null>(sortParam ?? 'popular')
    const [nearbyParams, setNearbyParams] = useState<{ lat?: number; lng?: number; withinKm?: 1 | 5 } | null>(() => {
        if (latParam && lngParam) {
            const parsedKm = withinKmParam ? parseInt(withinKmParam, 10) : 5
            const withinKm: 1 | 5 = parsedKm === 1 ? 1 : 5
            return {
                lat: parseFloat(latParam),
                lng: parseFloat(lngParam),
                withinKm,
            }
        }
        return null
    })
    const [sortOpen, setSortOpen] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(() => {
        // Initialize with proximity if coming from "Near You" See All
        if (latParam && lngParam && withinKmParam) {
            const parsedKm = parseInt(withinKmParam, 10)
            const withinKm: 1 | 5 = parsedKm === 1 ? 1 : 5
            return {
                categoryId: null,
                city: null,
                proximity: withinKm === 1 ? 'within_1km' : 'within_5km',
                priceMin: null,
                priceMax: null,
                availabilityDate: null,
                availabilityHour: 12,
                availabilityMinute: 0,
                availabilityPeriod: 'AM',
            }
        }
        return null
    })

    // Apply sort and nearby params from route params
    useEffect(() => {
        if (sortParam) {
            setSort(sortParam)
        } else {
            setSort('popular')
        }
        setCursor(null)

        if (latParam && lngParam) {
            const parsedKm = withinKmParam ? parseInt(withinKmParam, 10) : 5
            const withinKm: 1 | 5 = parsedKm === 1 ? 1 : 5
            setNearbyParams({
                lat: parseFloat(latParam),
                lng: parseFloat(lngParam),
                withinKm,
            })
            // Set proximity filter for FilterModal chip
            setAppliedFilters((prev) => ({
                ...(prev ?? {
                    categoryId: null,
                    city: null,
                    priceMin: null,
                    priceMax: null,
                    availabilityDate: null,
                    availabilityHour: 12,
                    availabilityMinute: 0,
                    availabilityPeriod: 'AM' as const,
                }),
                proximity: withinKm === 1 ? 'within_1km' : 'within_5km',
            }))
        } else {
            // Reset nearby params and proximity when navigating without location params
            setNearbyParams(null)
            setAppliedFilters((prev) => {
                if (!prev?.proximity) return prev
                return { ...prev, proximity: null }
            })
        }
    }, [sortParam, latParam, lngParam, withinKmParam])

    const { location: userLocation } = useEnsureLocation()
    const dispatch = useAppDispatch()
    const selectedCity = useAppSelector(selectSelectedCity)
    const appliedFiltersRef = useRef(appliedFilters)

    // Apply category filter from route params (or reset when no category)
    useEffect(() => {
        if (categorySlug && categories.length > 0) {
            const category = categories.find((c) => c.slug === categorySlug)
            if (category) {
                setAppliedFilters((prev) => ({
                    ...(prev ?? {}),
                    categoryId: category.id,
                    city: prev?.city ?? null,
                    proximity: prev?.proximity ?? null,
                    priceMin: prev?.priceMin ?? null,
                    priceMax: prev?.priceMax ?? null,
                    availabilityDate: prev?.availabilityDate ?? null,
                    availabilityHour: prev?.availabilityHour ?? 12,
                    availabilityMinute: prev?.availabilityMinute ?? 0,
                    availabilityPeriod: prev?.availabilityPeriod ?? 'AM',
                }))
                setCursor(null)
            }
        } else {
            // Reset category filter when navigating without categorySlug (empty string or undefined)
            setAppliedFilters((prev) => {
                if (!prev?.categoryId) return prev
                return { ...prev, categoryId: null }
            })
            setCursor(null)
        }
    }, [categorySlug, categories])

    // Safe ref update via useEffect (React Compiler compatible)
    useEffect(() => {
        appliedFiltersRef.current = appliedFilters
    }, [appliedFilters])

    const sortLabel = sort ? (SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort by') : 'Sort by'

    const displayCity = appliedFilters?.city ?? selectedCity ?? 'All Cities'

    const queryArgs = useMemo<SearchBusinessesArgs>(() => {
        const args: SearchBusinessesArgs = {
            cursor: cursor ?? undefined,
        }

        if (debouncedSearchText.trim()) {
            args.search = debouncedSearchText.trim()
        }

        if (sort) {
            args.sort = sort
        }

        // Apply nearby params from route (for "Near You" see all)
        if (nearbyParams) {
            if (nearbyParams.lat != null) args.lat = nearbyParams.lat
            if (nearbyParams.lng != null) args.lng = nearbyParams.lng
            if (nearbyParams.withinKm != null) args.withinKm = nearbyParams.withinKm
        }

        for (const chip of FILTER_CHIPS) {
            if (activeChips.has(chip.id)) {
                // Skip service-specific chips when no search
                if (chip.requiresSearch && !debouncedSearchText.trim()) continue
                Object.assign(args, chip.getParams())
            }
        }

        if (appliedFilters) {
            const hasSearch = !!debouncedSearchText.trim()
            const filterArgs = filterValuesToSearchArgs(appliedFilters, userLocation, hasSearch)
            Object.assign(args, filterArgs)
        }

        return args
    }, [debouncedSearchText, activeChips, sort, cursor, appliedFilters, userLocation, nearbyParams])

    const { data, isLoading, isFetching, refetch } = useSearchBusinessesQuery(queryArgs)

    const businesses = useMemo(() => data?.data ?? [], [data])
    const meta = data?.meta
    const totalCount = meta?.totalCount

    const toggleChip = useCallback((chipId: string) => {
        setActiveChips((prev) => {
            const next = new Set(prev)
            const wasActive = next.has(chipId)
            if (wasActive) {
                next.delete(chipId)
            } else {
                next.add(chipId)
            }
            // best-price: clear sort when activated, restore to popular when deactivated
            if (chipId === 'best-price') {
                setSort(wasActive ? 'popular' : null)
            }
            return next
        })
        setCursor(null)
    }, [])

    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text)
        setCursor(null)
        // Deactivate service-specific chips when search is cleared
        if (!text.trim()) {
            setActiveChips((prev) => {
                const next = new Set(prev)
                for (const chip of FILTER_CHIPS) {
                    if (chip.requiresSearch) next.delete(chip.id)
                }
                return next.size === prev.size ? prev : next
            })
        }
    }, [])

    const loadMore = useCallback(() => {
        if (meta?.hasNextPage && meta.nextCursor && !isFetching) {
            setCursor(meta.nextCursor)
        }
    }, [meta, isFetching])

    const handleRefresh = useCallback(() => {
        setCursor(null)
        refetch()
    }, [refetch])

    const handleSortChange = useCallback((value: BusinessSort) => {
        setSort(value)
        setSortOpen(false)
        setCursor(null)
        // Deactivate best-price when a sort is selected
        setActiveChips((prev) => {
            if (!prev.has('best-price')) return prev
            const next = new Set(prev)
            next.delete('best-price')
            return next
        })
    }, [])

    const handleApplyFilters = useCallback(
        (values: FilterValues) => {
            setAppliedFilters(values)
            setCursor(null)
            // Sync city to Redux for cross-screen access
            dispatch(setSelectedCity(values.city ?? null))
        },
        [dispatch]
    )

    const keyExtractor = useCallback((item: BusinessCardDto) => item.id, [])

    const renderItem = useCallback(
        ({ item }: { item: BusinessCardDto }) => (
            <View className="mb-4">
                <ServiceCard business={item} analyticsSource={AnalyticsSource.SEARCH} />
            </View>
        ),
        []
    )

    const ListHeader = useMemo(
        () =>
            totalCount != null ? <AppText className="mb-4 text-[20px] font-poppins-semibold text-brand">{totalCount} Results Found</AppText> : null,
        [totalCount]
    )

    const ListFooter = useMemo(() => {
        if (isLoading) return null

        return (
            <View className="mb-6">
                {/* ── Load more ───────────────────── */}
                {meta?.hasNextPage && (
                    <AppPressable onPress={loadMore} className="items-center rounded-xl bg-brand/10 py-3">
                        {isFetching ? <AppLoader size="sm" /> : <AppText className="text-status font-poppins-medium text-brand">Load more</AppText>}
                    </AppPressable>
                )}

                {/* ── Empty state ─────────────────── */}
                {businesses.length === 0 && (
                    <View className="items-center py-10">
                        <AppText className="text-subtitle text-text-muted">No results found</AppText>
                    </View>
                )}
            </View>
        )
    }, [isLoading, meta?.hasNextPage, loadMore, isFetching, businesses.length])

    const refreshControl = useMemo(
        () => <RefreshControl refreshing={isFetching && !isLoading && cursor === null} onRefresh={handleRefresh} tintColor="#0C2A63" />,
        [isFetching, isLoading, cursor, handleRefresh]
    )

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
                {/* ── Fixed Header ────────────────────────────── */}
                <View className="px-screen">
                    {/* ── Location row ─────────────────────────── */}
                    <View className="mb-6 flex-row items-center justify-between">
                        <View>
                            <AppText className="text-[12px] text-text-muted mb-3">Location</AppText>
                            <AppPressable onPress={() => setFilterOpen(true)} className="flex-row items-center gap-3.5">
                                <MapMarkerIcon width={24} height={24} />
                                <AppText className="text-subtitle font-poppins-medium text-brand">{displayCity}</AppText>
                                <Feather name="chevron-down" size={20} color="#e89f48" className={'mt-1'} />
                            </AppPressable>
                        </View>
                    </View>

                    {/* ── Search bar row ────────────────────────── */}
                    <View className="mb-4 flex-row items-center gap-3">
                        <View className="flex-1">
                            <AppInput
                                leftIcon={<Feather name="search" size={18} color="#8D8C92" />}
                                clearable
                                value={searchText}
                                onChangeText={handleSearchChange}
                                placeholder="Search services..."
                            />
                        </View>
                    </View>

                    {/* ── Filter chips ──────────────────────────── */}
                    <View className="mb-4 flex-row flex-wrap gap-2">
                        {FILTER_CHIPS.map((chip) => {
                            const active = activeChips.has(chip.id)
                            const disabled = chip.requiresSearch && !searchText.trim()
                            return (
                                <AppPressable
                                    key={chip.id}
                                    disabled={disabled}
                                    disabledClassName=""
                                    onPress={() => toggleChip(chip.id)}
                                    className={
                                        active
                                            ? 'flex-row items-center gap-1 rounded-xl bg-orange px-2.5 py-1.5'
                                            : disabled
                                              ? 'flex-row items-center rounded-xl border border-border bg-white px-2.5 py-1.5 opacity-40'
                                              : 'flex-row items-center rounded-xl border border-border bg-white px-2.5 py-1.5'
                                    }
                                >
                                    <AppText
                                        className={
                                            active ? 'text-status font-poppins-medium text-white' : 'text-status font-poppins-medium text-text'
                                        }
                                    >
                                        {chip.label}
                                    </AppText>
                                    {active && <Feather name="x" size={14} color="#fff" />}
                                </AppPressable>
                            )
                        })}
                    </View>

                    {/* ── Sort & advanced filter row ────────────── */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <AppPressable onPress={() => setSortOpen(true)} className="flex-row items-center gap-1 rounded-pill bg-brand px-5 py-2.5">
                            <AppText className="text-status font-poppins-medium text-white">{sortLabel}</AppText>
                            <Feather name="chevron-down" size={16} color="#fff" />
                        </AppPressable>
                        <AppPressable onPress={() => setFilterOpen(true)} className="items-center justify-center rounded-xl bg-orange p-2.5">
                            <Feather name="sliders" size={20} color="#fff" />
                        </AppPressable>
                    </View>
                </View>

                {/* ── Scrollable List with Pull-to-Refresh ────────────────────────────── */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <AppLoader size="sm" showTitle showSubtitle />
                    </View>
                ) : (
                    <FlatList
                        data={businesses}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
                        initialNumToRender={5}
                        maxToRenderPerBatch={4}
                        windowSize={5}
                        removeClippedSubviews={false}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={refreshControl}
                    />
                )}
            </SafeAreaView>

            {/* ── Sort dropdown modal (conditional render) ──────────────────── */}
            {sortOpen && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
                    <Pressable className="flex-1 items-center justify-center bg-black/30" onPress={() => setSortOpen(false)}>
                        <View className="w-[220px] rounded-2xl bg-white p-2" style={dropdownShadow}>
                            {SORT_OPTIONS.map((option) => (
                                <Pressable
                                    key={option.label}
                                    onPress={() => handleSortChange(option.value)}
                                    className={`rounded-xl px-4 py-3 ${option.value === sort ? 'bg-[#F0F3FB]' : ''}`}
                                >
                                    <AppText className={`font-poppins-medium text-[14px] ${option.value === sort ? 'text-brand' : 'text-text'}`}>
                                        {option.label}
                                    </AppText>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* ── Filter modal (conditional render) ──────────────────── */}
            {filterOpen && (
                <FilterModal
                    visible
                    onClose={() => setFilterOpen(false)}
                    onApply={handleApplyFilters}
                    initialValues={appliedFiltersRef.current ?? undefined}
                    hasSearch={!!debouncedSearchText.trim()}
                />
            )}
        </View>
    )
}
