import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { resetBookingFlow } from '@/store/features/booking-flow/bookingFlow.slice'
import { useAppDispatch } from '@/store/hooks'
import DoneImg from '@/assets/images/done-orange.svg'

const BookingSuccessScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleViewBookings = () => {
        dispatch(resetBookingFlow())
        router.replace('/(protected)/user/bookings')
    }

    const handleGoHome = () => {
        dispatch(resetBookingFlow())
        // TODO: revert to '/(protected)/user/(tabs)' after testing
        router.replace('/(protected)/user/(tabs)/test-gamma')
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1 items-center justify-center px-6">
                <View className="h-20 w-20 items-center justify-center rounded-full  mb-6">
                    <DoneImg />
                </View>
                <AppText className="text-[22px] font-poppins-semibold text-[#0C2A63] mb-2 text-center">Congratulations!</AppText>
                <AppText className="text-[14px] text-text-muted text-center mb-8 leading-5">Your application has been successfully created!</AppText>
                <View className="w-full gap-3">
                    <AppButton title="View My Bookings" onPress={handleViewBookings} />
                    <AppButton title="Back to Home" onPress={handleGoHome} variant="outline" />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default BookingSuccessScreen
