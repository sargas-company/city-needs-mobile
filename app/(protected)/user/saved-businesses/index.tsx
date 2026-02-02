import React, { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { router } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { useGetSavedBusinessesQuery } from '@/store/features/saved-businesses/savedBusinessesApi'
import { SavedBusinessesList } from '@/components/saved-businesses/SavedBusinessesList'

const LIMIT = 10

const SavedBusinessesScreen = () => {
    const [cursor, setCursor] = useState<string | null>(null)

    const { data, isLoading, isFetching, error, refetch } = useGetSavedBusinessesQuery({
        cursor,
        limit: LIMIT,
    })

    const items = useMemo(() => data?.data ?? [], [data?.data])
    const hasNextPage = data?.meta?.hasNextPage ?? false
    const nextCursor = data?.meta?.nextCursor ?? null

    const loadNext = () => {
        if (isFetching) return
        if (!hasNextPage) return
        if (!nextCursor) return
        setCursor(nextCursor)
    }

    const onRefresh = async () => {
        setCursor(null)
        refetch()
    }

    return (
        <View className="flex-1 pt-[130px]">
            <View className="px-6 pt-3">
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-12 w-12 items-center justify-center rounded-full bg-white"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>

                    <AppText className="flex-1 text-center font-poppins-semibold text-[18px] text-[#0C2A63]">Saved Businesses</AppText>

                    <View className="h-12 w-12" />
                </View>
            </View>

            <SavedBusinessesList
                data={items}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                hasNextPage={hasNextPage}
                onEndReached={loadNext}
                onRefresh={onRefresh}
            />
        </View>
    )
}

export default SavedBusinessesScreen
