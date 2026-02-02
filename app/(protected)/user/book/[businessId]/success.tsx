import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { resetBookingFlow } from '@/store/features/booking-flow/bookingFlow.slice'
import { useAppDispatch } from '@/store/hooks'

const BookingSuccessScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleViewBookings = () => {
        dispatch(resetBookingFlow())
        router.replace('/(protected)/user/bookings')
    }

    const handleGoHome = () => {
        dispatch(resetBookingFlow())
        router.replace('/(protected)/user/(tabs)')
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1 items-center justify-center px-6">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                    <Feather name="check" size={40} color="#22C55E" />
                </View>

                <AppText className="text-[22px] font-poppins-semibold text-[#0C2A63] mb-2 text-center">Booking Confirmed!</AppText>

                <AppText className="text-[14px] text-text-muted text-center mb-8 leading-5">
                    Your booking has been successfully created. You will receive a confirmation once the business approves it.
                </AppText>

                <View className="w-full gap-3">
                    <AppButton title="View My Bookings" onPress={handleViewBookings} />
                    <AppButton title="Back to Home" onPress={handleGoHome} variant="outline" />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default BookingSuccessScreen
