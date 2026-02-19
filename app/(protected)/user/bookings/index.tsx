import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { BookingCard, BookingStatus, type Booking } from '@/components/bookings/BookingCard'
import { BookingDetailsSheet } from '@/components/bookings/BookingDetailsSheet'
import { useCancelBookingMutation, useGetMyBookingsQuery } from '@/store/features/bookings/bookingsApi'
import type { ApiBookingStatus, BookingListItemDto } from '@/store/features/bookings/bookings.types'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

type TabKey = 'all' | 'awaitingReview'

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} className="items-center">
            <AppText className={`font-poppins-semibold text-[14px] ${active ? 'text-[#0C2A63]' : 'text-[#CBCBCB]'}`}>{title}</AppText>
            <View className={`mt-2 h-[3px] w-16 rounded-full ${active ? 'bg-[#0C2A63]' : 'bg-transparent'}`} />
        </Pressable>
    )
}

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

function mapToBooking(item: BookingListItemDto): Booking {
    const name = item.businessName ?? 'Booking'
    const nameParts = name.split(' ')

    return {
        id: item.id,
        businessId: item.businessId,
        customer: {
            firstName: nameParts[0] ?? name,
            lastName: nameParts.slice(1).join(' ') || '',
            avatarUrl: item.businessLogo?.url ?? null,
            phone: item.businessPhone ?? null,
        },
        services: item.services.map((s) => ({ name: s.name, price: s.price })),
        totalPrice: item.totalPrice,
        dateLabel: formatDateLabel(item.startAt),
        timeLabel: formatTimeLabel(item.startAt),
        status: STATUS_MAP[item.status] ?? BookingStatus.NEW,
        hasReview: item.hasReview,
    }
}

const LIMIT = 10

const UserBookingsScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [allCursor, setAllCursor] = useState<string | null>(null)
    const [reviewCursor, setReviewCursor] = useState<string | null>(null)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current)
            }
        }
    }, [])

    const allQuery = useGetMyBookingsQuery({ cursor: allCursor, limit: LIMIT })
    const reviewQuery = useGetMyBookingsQuery({ cursor: reviewCursor, limit: LIMIT, withoutReview: true })
    const [cancelBooking] = useCancelBookingMutation()

    const activeQuery = activeTab === 'all' ? allQuery : reviewQuery

    const bookings = useMemo(() => (activeQuery.data?.data ?? []).map(mapToBooking), [activeQuery.data?.data])
    const hasNextPage = activeQuery.data?.meta?.hasNextPage ?? false
    const nextCursor = activeQuery.data?.meta?.nextCursor ?? null

    const loadNext = () => {
        if (activeQuery.isFetching || !hasNextPage || !nextCursor) return
        if (activeTab === 'all') {
            setAllCursor(nextCursor)
        } else {
            setReviewCursor(nextCursor)
        }
    }

    const onRefresh = async () => {
        setIsRefreshing(true)
        if (activeTab === 'all') {
            setAllCursor(null)
        } else {
            setReviewCursor(null)
        }
        await activeQuery.refetch()
        setIsRefreshing(false)
    }

    const keyExtractor = useCallback((item: Booking) => item.id, [])

    const openSheet = useCallback((item: Booking) => {
        setSelectedBooking(item)
        setIsSheetOpen(true)
    }, [])

    const closeSheet = useCallback(() => {
        setIsSheetOpen(false)
        // Clear any pending timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
        }
        // Delay clearing booking to allow sheet close animation to complete
        closeTimeoutRef.current = setTimeout(() => {
            setSelectedBooking(null)
            closeTimeoutRef.current = null
        }, 300)
    }, [])

    const handleCancel = useCallback(async () => {
        if (!selectedBooking) return
        try {
            await cancelBooking({ id: selectedBooking.id, data: {} }).unwrap()
            closeSheet()
            activeQuery.refetch()
        } catch {
            // silently fail for now
        }
    }, [selectedBooking, cancelBooking, closeSheet, activeQuery])

    const handleLeaveReview = useCallback(() => {
        if (!selectedBooking) return
        closeSheet()
        router.push(`/(protected)/user/book/${selectedBooking.businessId}/leave-review?bookingId=${selectedBooking.id}`)
    }, [selectedBooking, closeSheet, router])

    const renderItem = useCallback(({ item }: { item: Booking }) => <BookingCard booking={item} onPress={() => openSheet(item)} />, [openSheet])

    const emptyText = activeTab === 'all' ? 'No bookings yet' : 'No bookings awaiting review'

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

                    <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">My Bookings</AppText>

                    <View className="h-11 w-11" />
                </View>

                <View className="mb-4 flex-row items-center justify-center gap-10">
                    <TabButton title="My Bookings" active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
                    <TabButton title="Awaiting Review" active={activeTab === 'awaitingReview'} onPress={() => setActiveTab('awaitingReview')} />
                </View>

                {activeQuery.isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : activeQuery.error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load bookings</AppText>
                    </View>
                ) : bookings.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-text-muted">{emptyText}</AppText>
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
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <BookingDetailsSheet
                isOpen={isSheetOpen}
                booking={selectedBooking}
                onClose={closeSheet}
                onCancel={handleCancel}
                onLeaveReview={handleLeaveReview}
            />
        </SafeAreaView>
    )
}

export default UserBookingsScreen
