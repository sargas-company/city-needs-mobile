import React, { useCallback, useMemo } from 'react'
import { ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { BookingStepHeader } from '@/components/booking/BookingStepHeader'
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { setBookingError, setBookingSubmitting, setBookingSubmitted, setNotes } from '@/store/features/booking-flow/bookingFlow.slice'
import {
    selectBookingFlow,
    selectBookingFlowStatus,
    selectBookingFlowError,
    selectIsBookingReady,
} from '@/store/features/booking-flow/bookingFlow.selectors'
import { useCreateBookingMutation } from '@/store/features/bookings/bookingsApi'
import { useGetPublicBusinessQuery, useGetPublicBusinessServicesQuery } from '@/store/features/public-business/publicBusinessApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatTimeLabel(iso: string): string {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const ReviewScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const bookingFlow = useAppSelector(selectBookingFlow)
    const status = useAppSelector(selectBookingFlowStatus)
    const flowError = useAppSelector(selectBookingFlowError)
    const isReady = useAppSelector(selectIsBookingReady)

    const { data: businessData } = useGetPublicBusinessQuery(businessId!)
    const { data: servicesData } = useGetPublicBusinessServicesQuery(businessId!)
    const [createBooking] = useCreateBookingMutation()

    const allServices = useMemo(() => servicesData?.data ?? [], [servicesData])
    const selectedServices = useMemo(
        () => allServices.filter((s) => bookingFlow.selectedServiceIds.includes(s.id)),
        [allServices, bookingFlow.selectedServiceIds]
    )

    const dateLabel = bookingFlow.selectedDate ? formatDateLabel(bookingFlow.selectedDate) : ''
    const timeLabel = bookingFlow.selectedTimeSlot ? formatTimeLabel(bookingFlow.selectedTimeSlot) : ''

    const handleNotesChange = useCallback(
        (text: string) => {
            dispatch(setNotes(text))
        },
        [dispatch]
    )

    const handleConfirm = async () => {
        if (!isReady || !bookingFlow.selectedTimeSlot) return

        dispatch(setBookingSubmitting())
        try {
            await createBooking({
                businessId: businessId!,
                serviceIds: bookingFlow.selectedServiceIds,
                startAt: bookingFlow.selectedTimeSlot,
            }).unwrap()

            dispatch(setBookingSubmitted())
            router.replace(`/(protected)/user/book/${businessId}/success`)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create booking'
            dispatch(setBookingError(message))
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <BookingStepHeader title="Review Booking" />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                <BookingSummaryCard businessName={businessData?.name ?? ''} services={selectedServices} dateLabel={dateLabel} timeLabel={timeLabel} />

                <View className="mt-6">
                    <AppText className="text-[15px] font-poppins-medium text-[#0C2A63] mb-2">Notes (optional)</AppText>
                    <TextInput
                        value={bookingFlow.notes}
                        onChangeText={handleNotesChange}
                        placeholder="Add any special requests or notes..."
                        placeholderTextColor="#8896AB"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="rounded-2xl border border-border px-4 py-3 text-[14px] font-poppins text-[#0C2A63] min-h-[100px]"
                    />
                </View>

                {flowError && (
                    <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
                        <AppText className="text-[14px] text-red-600">{flowError}</AppText>
                    </View>
                )}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8">
                <AppButton title="Confirm Booking" onPress={handleConfirm} disabled={!isReady} loading={status === 'submitting'} />
            </View>
        </SafeAreaView>
    )
}

export default ReviewScreen
