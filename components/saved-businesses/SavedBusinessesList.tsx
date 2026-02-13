import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import type { SavedBusinessCard as SavedBusinessCardT } from '@/store/features/saved-businesses/savedBusinesses.types'

import { SavedBusinessCard } from './SavedBusinessCard'

type Props = {
    data: SavedBusinessCardT[]
    isLoading: boolean
    isFetching: boolean
    error?: unknown
    hasNextPage: boolean
    onEndReached: () => void
    onRefresh: () => void
}

export const SavedBusinessesList = ({ data, isLoading, isFetching, error, hasNextPage, onEndReached, onRefresh }: Props) => {
    const router = useRouter()
    const keyExtractor = useCallback((item: SavedBusinessCardT) => item.id, [])

    const handlePress = useCallback(
        (businessId: string) => {
            router.push(`/(protected)/user/book/${businessId}`)
        },
        [router]
    )

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        )
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load saved businesses</AppText>
            </View>
        )
    }

    if (!data?.length) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">No saved businesses yet</AppText>
            </View>
        )
    }

    return (
        <FlatList
            data={data}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={({ item }) => (
                <SavedBusinessCard name={item.name} city={item.city} logoUrl={item.logoUrl} onPress={() => handlePress(item.id)} />
            )}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
                if (!isFetching && hasNextPage) onEndReached()
            }}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
            ListFooterComponent={
                isFetching && hasNextPage ? (
                    <View className="py-6">
                        <ActivityIndicator />
                    </View>
                ) : null
            }
            showsVerticalScrollIndicator={false}
        />
    )
}
