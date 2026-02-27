import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReelCard } from '@/components/reels/ReelCard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useGetReelsFeedQuery } from '@/store/features/reels/reelsApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import type { GetReelsFeedArgs, ReelFeedItem } from '@/store/features/reels/reels.types'

export default function ReelsScreen() {
    const [searchText, setSearchText] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)

    const { data: categories } = useGetCategoriesQuery()

    const queryArgs = useMemo<GetReelsFeedArgs>(() => {
        const args: GetReelsFeedArgs = {
            cursor: cursor ?? undefined,
        }

        if (searchText.trim()) {
            args.search = searchText.trim()
        }

        if (selectedCategoryId) {
            args.categoryId = selectedCategoryId
        }

        return args
    }, [searchText, selectedCategoryId, cursor])

    const { data, isLoading, isFetching, refetch } = useGetReelsFeedQuery(queryArgs)

    const reels = useMemo(() => data?.items ?? [], [data])
    const feedData = data

    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text)
        setCursor(null)
    }, [])

    const handleCategoryPress = useCallback((categoryId: string | null) => {
        setSelectedCategoryId(categoryId)
        setCursor(null)
    }, [])

    const loadMore = useCallback(() => {
        if (feedData?.hasNextPage && feedData.nextCursor && !isFetching) {
            setCursor(feedData.nextCursor)
        }
    }, [feedData, isFetching])

    const handleRefresh = useCallback(() => {
        setCursor(null)
        refetch()
    }, [refetch])

    const categoryChips = useMemo(() => {
        const allOption = { id: null as string | null, title: 'All' }
        return [allOption, ...(categories ?? [])]
    }, [categories])

    const keyExtractor = useCallback((item: ReelFeedItem) => item.id, [])

    const renderItem = useCallback(
        ({ item }: { item: ReelFeedItem }) => (
            <View className="mb-4 px-screen">
                <ReelCard reel={item} />
            </View>
        ),
        []
    )

    const ListFooter = useMemo(() => {
        if (isLoading) return null

        return (
            <View className="mb-6 px-screen">
                {/* ── Load more ───────────────────── */}
                {feedData?.hasNextPage && (
                    <AppPressable onPress={loadMore} className="items-center rounded-xl bg-brand/10 py-3">
                        {isFetching ? (
                            <ActivityIndicator size="small" />
                        ) : (
                            <AppText className="text-status font-poppins-medium text-brand">Load more</AppText>
                        )}
                    </AppPressable>
                )}

                {/* ── Empty state ─────────────────── */}
                {reels.length === 0 && <EmptyState text="No reels found" className="py-10" imageWidth={130} imageHeight={130} />}
            </View>
        )
    }, [isLoading, feedData?.hasNextPage, loadMore, isFetching, reels.length])

    const refreshControl = useMemo(
        () => <RefreshControl refreshing={isFetching && !isLoading && cursor === null} onRefresh={handleRefresh} tintColor="#0C2A63" />,
        [isFetching, isLoading, cursor, handleRefresh]
    )

    return (
        <View className="flex-1 bg-white">
            <WaveHeader />

            <SafeAreaView className="flex-1" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
                {/* ── Fixed Header: Search + Categories ────────────────────────────── */}
                <View className="px-screen">
                    {/* ── Search bar ────────────────────────────── */}
                    <View className="mb-3">
                        <AppInput
                            leftIcon={<Feather name="search" size={18} color="#8D8C92" />}
                            clearable
                            value={searchText}
                            onChangeText={handleSearchChange}
                            placeholder="Search reels..."
                        />
                    </View>
                </View>

                {/* ── Category chips (horizontal scroll) ──────────────────────────── */}
                <View className="mb-3 h-10">
                    <FlatList
                        horizontal
                        data={categoryChips}
                        extraData={selectedCategoryId}
                        keyExtractor={(item) => item.id ?? 'all'}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
                        renderItem={({ item }) => {
                            const active = selectedCategoryId === item.id
                            return (
                                <AppPressable
                                    onPress={() => handleCategoryPress(item.id)}
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
                                        {item.title}
                                    </AppText>
                                </AppPressable>
                            )
                        }}
                    />
                </View>

                {/* ── Scrollable List with Pull-to-Refresh ────────────────────────────── */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={reels}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ListFooterComponent={ListFooter}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        initialNumToRender={3}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={false}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={refreshControl}
                    />
                )}
            </SafeAreaView>
        </View>
    )
}
