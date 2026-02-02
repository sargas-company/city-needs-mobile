import React, { useMemo } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { BookingStepHeader } from '@/components/booking/BookingStepHeader'
import { ServiceSelectCard } from '@/components/booking/ServiceSelectCard'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { toggleService } from '@/store/features/booking-flow/bookingFlow.slice'
import { selectSelectedServiceIds } from '@/store/features/booking-flow/bookingFlow.selectors'
import { useGetPublicBusinessServicesQuery } from '@/store/features/public-business/publicBusinessApi'
import type { PublicServiceDto } from '@/store/features/public-business/publicBusiness.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

const SelectServicesScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const selectedIds = useAppSelector(selectSelectedServiceIds)
    const { data, isLoading, error } = useGetPublicBusinessServicesQuery(businessId!)

    const activeServices = useMemo(() => (data?.data ?? []).filter((s) => s.status === 'ACTIVE'), [data?.data])

    const summary = useMemo(() => {
        const selected = activeServices.filter((s) => selectedIds.includes(s.id))
        return {
            count: selected.length,
            totalPrice: selected.reduce((sum, s) => sum + s.price, 0),
            totalDuration: selected.reduce((sum, s) => sum + s.duration, 0),
        }
    }, [activeServices, selectedIds])

    const handleToggle = (id: string) => {
        dispatch(toggleService(id))
    }

    const handleContinue = () => {
        router.push(`/(protected)/user/book/${businessId}/select-datetime`)
    }

    const renderItem = ({ item }: { item: PublicServiceDto }) => (
        <ServiceSelectCard
            name={item.name}
            price={item.price}
            duration={item.duration}
            selected={selectedIds.includes(item.id)}
            onToggle={() => handleToggle(item.id)}
        />
    )

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <BookingStepHeader title="Select Services" />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load services</AppText>
                </View>
            ) : activeServices.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText className="text-center font-poppins-medium text-[14px] text-text-muted">No services available</AppText>
                </View>
            ) : (
                <FlatList
                    data={activeServices}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 140 }}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 pb-8">
                {summary.count > 0 && (
                    <View className="flex-row items-center justify-between mb-3">
                        <AppText className="text-[14px] text-text-muted">
                            {summary.count} service{summary.count > 1 ? 's' : ''} selected
                        </AppText>
                        <AppText className="text-[16px] font-poppins-semibold text-brand">{formatPrice(summary.totalPrice)}</AppText>
                    </View>
                )}
                <AppButton title="Continue" onPress={handleContinue} disabled={summary.count === 0} />
            </View>
        </SafeAreaView>
    )
}

export default SelectServicesScreen
