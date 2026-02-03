import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'
import type { BusinessSort, SearchBusinessesArgs } from '@/store/features/search/search.types'

// ── Filter chip config ──────────────────────────────────────────────────────────

type FilterChip = {
    id: string
    label: string
    getParams: () => Partial<SearchBusinessesArgs>
}

const FILTER_CHIPS: FilterChip[] = [
    { id: 'open-now', label: 'Open Now', getParams: () => ({ openNow: true }) },
    { id: 'top-rated', label: 'Top Rated', getParams: () => ({ topRated: true }) },
    { id: 'best-price', label: 'Best Price', getParams: () => ({ bestPrice: true }) },
]

const SORT_OPTIONS: { value: BusinessSort; label: string }[] = [
    { value: 'popular', label: 'Popular' },
    { value: 'top_rated', label: 'Top Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'nearby', label: 'Nearby' },
]

// ── SearchScreen ───────────────────────────────────────────────────────────────

export default function SearchScreen() {
    const [searchText, setSearchText] = useState('')
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
    const [sort, setSort] = useState<BusinessSort>('popular')
    const [sortOpen, setSortOpen] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)

    const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Popular'

    const queryArgs = useMemo<SearchBusinessesArgs>(() => {
        const args: SearchBusinessesArgs = {
            sort,
            cursor: cursor ?? undefined,
        }

        if (searchText.trim()) {
            args.search = searchText.trim()
        }

        for (const chip of FILTER_CHIPS) {
            if (activeChips.has(chip.id)) {
                Object.assign(args, chip.getParams())
            }
        }

        return args
    }, [searchText, activeChips, sort, cursor])

    const { data, isLoading, isFetching } = useSearchBusinessesQuery(queryArgs)

    const businesses = data?.data ?? []
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
        setCursor(null)
    }, [])

    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text)
        setCursor(null)
    }, [])

    const loadMore = useCallback(() => {
        if (meta?.hasNextPage && meta.nextCursor && !isFetching) {
            setCursor(meta.nextCursor)
        }
    }, [meta, isFetching])

    const handleSortChange = useCallback((value: BusinessSort) => {
        setSort(value)
        setSortOpen(false)
        setCursor(null)
    }, [])

    return (
        <View className="flex-1 bg-white">
            <WaveHeader />

            <SafeAreaView className="flex-1" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-screen">
                    {/* ── Location row ─────────────────────────── */}
                    <View className="mb-3 flex-row items-center justify-between">
                        <View>
                            <AppText className="text-status text-text-muted">Location</AppText>
                            <View className="flex-row items-center gap-1">
                                <Feather name="map-pin" size={16} color="#e89f48" />
                                <AppText className="text-subtitle font-poppins-semibold text-text">Saskatoon</AppText>
                                <Feather name="chevron-down" size={16} color="#e89f48" />
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
                            return (
                                <AppPressable
                                    key={chip.id}
                                    onPress={() => toggleChip(chip.id)}
                                    className={
                                        active
                                            ? 'flex-row items-center gap-1 rounded-xl bg-orange px-2.5 py-1.5'
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
                        <AppPressable className="items-center justify-center rounded-xl bg-orange p-2.5">
                            <Feather name="sliders" size={20} color="#fff" />
                        </AppPressable>
                    </View>

                    {/* ── Sort dropdown modal ──────────────────── */}
                    <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
                        <Pressable className="flex-1 items-center justify-center bg-black/30" onPress={() => setSortOpen(false)}>
                            <View className="w-[220px] rounded-2xl bg-white p-2" style={dropdownShadow}>
                                {SORT_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option.value}
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

                    {/* ── Results count ─────────────────────────── */}
                    {totalCount != null && <AppText className="mb-4 text-title font-poppins-bold text-brand">{totalCount} Results Found</AppText>}

                    {/* ── Loading state ─────────────────────────── */}
                    {isLoading && (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" />
                        </View>
                    )}

                    {/* ── Service cards ─────────────────────────── */}
                    {!isLoading && (
                        <View className="mb-6 gap-4">
                            {businesses.map((business) => (
                                <ServiceCard key={business.id} business={business} />
                            ))}

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
                            {businesses.length === 0 && !isLoading && (
                                <View className="items-center py-10">
                                    <AppText className="text-subtitle text-text-muted">No results found</AppText>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const dropdownShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
}
