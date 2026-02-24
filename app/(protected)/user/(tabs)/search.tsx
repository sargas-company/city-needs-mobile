import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { FilterModal } from '@/components/filters/FilterModal'
import { filterValuesToSearchArgs, type FilterValues } from '@/components/filters/FilterModal.types'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import { AnalyticsSource } from '@/hooks/useTrackAnalytics'
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
    { id: 'best-price', label: 'Best Price', getParams: () => ({ bestPrice: true }), requiresSearch: true },
]

const SORT_OPTIONS: { value: BusinessSort | null; label: string }[] = [
    { value: null, label: 'None' },
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
    const [searchText, setSearchText] = useState('')
    const debouncedSearchText = useDebounce(searchText, 300)
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
    const [sort, setSort] = useState<BusinessSort | null>('popular')
    const [sortOpen, setSortOpen] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null)

    const { location: userLocation } = useEnsureLocation()
    const appliedFiltersRef = useRef(appliedFilters)

    // Safe ref update via useEffect (React Compiler compatible)
    useEffect(() => {
        appliedFiltersRef.current = appliedFilters
    }, [appliedFilters])

    const sortLabel = sort ? (SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort by') : 'Sort by'
    // Sort is disabled when best-price chip is active
    const isSortDisabled = activeChips.has('best-price')

    const displayCity = appliedFilters?.city ?? 'All Cities'

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
    }, [debouncedSearchText, activeChips, sort, cursor, appliedFilters, userLocation])

    const { data, isLoading, isFetching, refetch } = useSearchBusinessesQuery(queryArgs)

    const businesses = useMemo(() => data?.data ?? [], [data])
    const meta = data?.meta
    const totalCount = meta?.totalCount

    const toggleChip = useCallback((chipId: string) => {
        setActiveChips((prev) => {
            const next = new Set(prev)
            if (next.has(chipId)) {
                next.delete(chipId)
            } else {
                next.add(chipId)
            }
            return next
        })
        // best-price clears any sort
        if (chipId === 'best-price') {
            setSort(null)
        }
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

    const handleSortChange = useCallback((value: BusinessSort | null) => {
        setSort(value)
        setSortOpen(false)
        setCursor(null)
    }, [])

    const handleApplyFilters = useCallback((values: FilterValues) => {
        setAppliedFilters(values)
        setCursor(null)
    }, [])

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
        () => (totalCount != null ? <AppText className="mb-4 text-title font-poppins-bold text-brand">{totalCount} Results Found</AppText> : null),
        [totalCount]
    )

    const ListFooter = useMemo(() => {
        if (isLoading) return null

        return (
            <View className="mb-6">
                {/* ── Load more ───────────────────── */}
                {meta?.hasNextPage && (
                    <AppPressable onPress={loadMore} className="items-center rounded-xl bg-brand/10 py-3">
                        {isFetching ? (
                            <ActivityIndicator size="small" />
                        ) : (
                            <AppText className="text-status font-poppins-medium text-brand">Load more</AppText>
                        )}
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
                    <View className="mb-3 flex-row items-center justify-between">
                        <View>
                            <AppText className="text-status text-text-muted">Location</AppText>
                            <View className="flex-row items-center gap-1">
                                <Feather name="map-pin" size={16} color="#e89f48" />
                                <AppText className="text-subtitle font-poppins-semibold text-text">{displayCity}</AppText>
                            </View>
                        </View>
                    </View>

                    {/* ── Search bar row ────────────────────────── */}
                    <View className="mb-3 flex-row items-center gap-3">
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
                    <View className="mb-3 flex-row flex-wrap gap-2">
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
                        <AppPressable
                            onPress={() => setSortOpen(true)}
                            disabled={isSortDisabled}
                            disabledClassName=""
                            className={`flex-row items-center gap-1 rounded-pill bg-brand px-5 py-2.5 ${isSortDisabled ? 'opacity-40' : ''}`}
                        >
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
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={businesses}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
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
                            {SORT_OPTIONS.map((option) => {
                                const disabled = option.value !== null && isSortDisabled
                                return (
                                    <Pressable
                                        key={option.label}
                                        disabled={disabled}
                                        onPress={() => handleSortChange(option.value)}
                                        className={`rounded-xl px-4 py-3 ${option.value === sort ? 'bg-[#F0F3FB]' : ''}`}
                                        style={disabled ? { opacity: 0.4 } : undefined}
                                    >
                                        <AppText className={`font-poppins-medium text-[14px] ${option.value === sort ? 'text-brand' : 'text-text'}`}>
                                            {option.label}
                                        </AppText>
                                    </Pressable>
                                )
                            })}
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
