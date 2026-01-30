import React, { useCallback, useState } from 'react'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { BookingCard, type Booking } from '@/components/bookings/BookingCard'

const MOCK_BOOKINGS: Booking[] = [
    {
        id: '1',
        customer: { firstName: 'Daniel', lastName: 'Carson', avatarUrl: null },
        serviceName: 'Full grooming',
        price: 80,
        currency: 'USD',
        dateLabel: 'Th, 4 Dec 2025',
        timeLabel: '12:30',
        status: 'new',
    },
    {
        id: '2',
        customer: { firstName: 'Jennifer', lastName: 'Moore', avatarUrl: null },
        serviceName: 'Haircut',
        price: 20,
        currency: 'USD',
        dateLabel: 'Mon, 3 Dec 2025',
        timeLabel: '10:00',
        status: 'confirmed',
    },
    {
        id: '3',
        customer: { firstName: 'Alex', lastName: 'Patel', avatarUrl: null },
        serviceName: 'Ear cleaning',
        price: 10,
        currency: 'USD',
        dateLabel: 'Fr, 30 Nov 2025',
        timeLabel: '11:30',
        status: 'completed',
    },
]

const BookingsScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [bookings] = useState<Booking[]>(MOCK_BOOKINGS)

    const onRefresh = useCallback(() => {
        setIsRefreshing(true)
        setTimeout(() => {
            setIsRefreshing(false)
        }, 800)
    }, [])

    const keyExtractor = useCallback((item: Booking) => item.id, [])

    const renderItem = useCallback(({ item }: { item: Booking }) => <BookingCard booking={item} />, [])

    return (
        <SafeAreaView className="flex-1 bg-white pt-[140px]">
            <View className="flex-1">
                {/* Header */}
                <View className="relative items-center justify-center px-6 pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-6 h-14 w-14 items-center justify-center rounded-full border border-[#C9CEDA] bg-transparent"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, { top: 10 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Bookings</AppText>
                </View>

                {/* Bookings list */}
                <FlatList
                    data={bookings}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    )
}

export default BookingsScreen
