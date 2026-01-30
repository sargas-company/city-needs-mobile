import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { ServiceCard } from '@/components/business-services/ServiceCard'
import { useGetBusinessServicesQuery, useDeleteBusinessServiceMutation, type BusinessServiceDto } from '@/store/features/business/businessServicesApi'

const LIMIT = 10

const MyServicesScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [cursor, setCursor] = useState<string | null>(null)

    const { data, isLoading, isFetching, error, refetch } = useGetBusinessServicesQuery({ cursor, limit: LIMIT })
    const [deleteService] = useDeleteBusinessServiceMutation()

    const items = useMemo(() => data?.data ?? [], [data?.data])
    const hasNextPage = data?.meta?.hasNextPage ?? false
    const nextCursor = data?.meta?.nextCursor ?? null

    const loadNext = () => {
        if (isFetching || !hasNextPage || !nextCursor) return
        setCursor(nextCursor)
    }

    const onRefresh = () => {
        setCursor(null)
        refetch()
    }

    const handleDelete = (service: BusinessServiceDto) => {
        Alert.alert('Delete service', `Are you sure you want to delete "${service.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteService(service.id).unwrap()
                    } catch {
                        Alert.alert('Error', 'Failed to delete service.')
                    }
                },
            },
        ])
    }

    const keyExtractor = useCallback((item: BusinessServiceDto) => item.id, [])

    const renderItem = useCallback(
        ({ item }: { item: BusinessServiceDto }) => (
            <ServiceCard
                name={item.name}
                price={item.price}
                duration={item.duration}
                onEdit={() => router.push(`/(protected)/business/services/${item.id}/edit` as never)}
                onDelete={() => handleDelete(item)}
            />
        ),
        []
    )

    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center px-6">
            <View className="h-36 w-56 items-center justify-center rounded-2xl bg-[#EAF0FF]">
                <View className="h-3 w-16 rounded-full bg-white opacity-70" />
            </View>

            <AppText className="mt-6 text-center text-[26px] font-poppins-semibold text-[#0C2A63]">No services yet</AppText>
            <AppText className="mt-3 max-w-[270px] text-center text-[14px] font-poppins text-[#8E94A3]">
                Create your first service to make it available for booking
            </AppText>
        </View>
    )

    const renderFooter = () => {
        if (isFetching && hasNextPage) {
            return (
                <View className="py-6">
                    <ActivityIndicator />
                </View>
            )
        }

        return (
            <Pressable
                onPress={() => router.push('/(protected)/business/services/create')}
                className="mt-4 items-center justify-center rounded-2xl border border-dashed border-[#C9CEDA] py-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
                <View className="flex-row items-center gap-2">
                    <Feather name="plus" size={18} color="#0C2A63" />
                    <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">Add service</AppText>
                </View>
            </Pressable>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white pt-[140px]">
            <View className="flex-1">
                <View className="relative items-center justify-center px-6 pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-6 h-14 w-14 items-center justify-center rounded-full border border-[#C9CEDA] bg-transparent"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, { top: 10 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">My services</AppText>

                    <View className="absolute right-6 h-14 w-14" style={{ top: 10 }} />
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load services</AppText>
                    </View>
                ) : items.length === 0 ? (
                    <View className="flex-1">
                        {renderEmpty()}
                        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
                            {renderFooter()}
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
                        ItemSeparatorComponent={() => <View className="h-3" />}
                        onEndReachedThreshold={0.5}
                        onEndReached={loadNext}
                        refreshControl={<RefreshControl refreshing={isFetching && !hasNextPage} onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={renderFooter}
                    />
                )}
            </View>
        </SafeAreaView>
    )
}

export default MyServicesScreen
