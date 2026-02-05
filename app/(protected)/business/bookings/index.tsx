import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { BookingCard, BookingStatus, type Booking } from '@/components/bookings/BookingCard'
import { BookingDetailsSheet } from '@/components/bookings/BookingDetailsSheet'
import { useCancelBookingMutation, useGetBusinessBookingsQuery, useUpdateBookingStatusMutation } from '@/store/features/bookings/bookingsApi'
import type { ApiBookingStatus, BusinessBookingListItemDto } from '@/store/features/bookings/bookings.types'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { UserRole } from '@/store/features/profile/profile.types'

const STATUS_MAP: Record<ApiBookingStatus, BookingStatus> = {
    PENDING: BookingStatus.NEW,
    CONFIRMED: BookingStatus.CONFIRMED,
    COMPLETED: BookingStatus.COMPLETED,
    CANCELLED: BookingStatus.CANCELLED,
}

function formatDateLabel(iso: string): string {
    const d = new Date(iso)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Th', 'Fr', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatTimeLabel(iso: string): string {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function mapToBooking(item: BusinessBookingListItemDto): Booking {
    const name = item.userName ?? 'Customer'
    const nameParts = name.split(' ')

    console.warn(item)
    console.log(item)

    return {
        id: item.id,
        businessId: '',
        customer: {
            firstName: nameParts[0] ?? name,
            lastName: nameParts.slice(1).join(' ') || '',
            avatarUrl: item.userAvatar?.url ?? null,
        },
        services: item.services.map((s) => ({ name: s.name, price: s.price })),
        totalPrice: item.totalPrice,
        dateLabel: formatDateLabel(item.startAt),
        timeLabel: formatTimeLabel(item.startAt),
        status: STATUS_MAP[item.status] ?? BookingStatus.NEW,
    }
}

const LIMIT = 10

const BookingsScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [cursor, setCursor] = useState<string | null>(null)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading, isFetching, error, refetch } = useGetBusinessBookingsQuery({ cursor, limit: LIMIT })
    const [cancelBooking] = useCancelBookingMutation()
    const [updateStatus] = useUpdateBookingStatusMutation()

    const bookings = useMemo(() => (data?.data ?? []).map(mapToBooking), [data?.data])
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

    const keyExtractor = useCallback((item: Booking) => item.id, [])

    const openSheet = useCallback((item: Booking) => {
        setSelectedBooking(item)
        setIsSheetOpen(true)
    }, [])

    const closeSheet = useCallback(() => {
        setIsSheetOpen(false)
        setSelectedBooking(null)
    }, [])

    const handleConfirm = useCallback(async () => {
        if (!selectedBooking) return
        const nextStatus = selectedBooking.status === BookingStatus.NEW ? 'CONFIRMED' : 'COMPLETED'
        try {
            await updateStatus({ id: selectedBooking.id, data: { status: nextStatus } }).unwrap()
            closeSheet()
            refetch()
        } catch {
            // silently fail for now
        }
    }, [selectedBooking, updateStatus, closeSheet, refetch])

    const handleCancel = useCallback(async () => {
        if (!selectedBooking) return
        try {
            await cancelBooking({ id: selectedBooking.id, data: {} }).unwrap()
            closeSheet()
            refetch()
        } catch {
            // silently fail for now
        }
    }, [selectedBooking, cancelBooking, closeSheet, refetch])

    const renderItem = useCallback(({ item }: { item: Booking }) => <BookingCard booking={item} onPress={() => openSheet(item)} />, [openSheet])

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-6 mb-6">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">Bookings</AppText>

                    <View className="h-11 w-11" />
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load bookings</AppText>
                    </View>
                ) : bookings.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-text-muted">No bookings yet</AppText>
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
                        ItemSeparatorComponent={() => <View className="h-3" />}
                        onEndReachedThreshold={0.5}
                        onEndReached={loadNext}
                        refreshControl={<RefreshControl refreshing={isFetching && !hasNextPage} onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <BookingDetailsSheet
                isOpen={isSheetOpen}
                booking={selectedBooking}
                role={UserRole.BUSINESS_OWNER}
                onClose={closeSheet}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </SafeAreaView>
    )
}

export default BookingsScreen
