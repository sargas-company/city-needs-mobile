import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { BookingStepHeader } from '@/components/booking/BookingStepHeader'
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { setSelectedDate, setSelectedTimeSlot } from '@/store/features/booking-flow/bookingFlow.slice'
import { selectSelectedDate, selectSelectedServiceIds, selectSelectedTimeSlot } from '@/store/features/booking-flow/bookingFlow.selectors'
import { useGetBusinessAvailabilityQuery } from '@/store/features/public-business/publicBusinessApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOffset(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
}

function formatSelectedDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    const dayName = DAY_NAMES_SHORT[date.getDay()]
    const day = date.getDate()
    const month = MONTHS_SHORT[date.getMonth()]
    const year = date.getFullYear()
    return `${dayName}, ${day} ${month} ${year}`
}

const SelectDateTimeScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const selectedServiceIds = useAppSelector(selectSelectedServiceIds)
    const selectedDate = useAppSelector(selectSelectedDate)
    const selectedTimeSlot = useAppSelector(selectSelectedTimeSlot)

    const today = useMemo(() => new Date(), [])
    const todayString = useMemo(() => toDateString(today), [today])
    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())

    const { data: availabilityData, isLoading: isLoadingSlots } = useGetBusinessAvailabilityQuery(
        {
            businessId: businessId!,
            date: selectedDate!,
            serviceIds: selectedServiceIds,
        },
        { skip: !selectedDate || selectedServiceIds.length === 0 }
    )

    const slots = availabilityData?.slots ?? []

    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth)
        const offset = getFirstDayOffset(viewYear, viewMonth)
        const cells: (number | null)[] = Array(offset).fill(null)
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(d)
        }
        return cells
    }, [viewYear, viewMonth])

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewYear((y) => y - 1)
            setViewMonth(11)
        } else {
            setViewMonth((m) => m - 1)
        }
    }

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1)
            setViewMonth(0)
        } else {
            setViewMonth((m) => m + 1)
        }
    }

    const handleSelectDate = useCallback(
        (day: number) => {
            const m = String(viewMonth + 1).padStart(2, '0')
            const d = String(day).padStart(2, '0')
            dispatch(setSelectedDate(`${viewYear}-${m}-${d}`))
        },
        [dispatch, viewYear, viewMonth]
    )

    const handleSelectSlot = useCallback(
        (startAt: string) => {
            dispatch(setSelectedTimeSlot(startAt))
        },
        [dispatch]
    )

    const handleContinue = () => {
        router.push(`/(protected)/user/book/${businessId}/review`)
    }

    const isPastDay = useCallback(
        (day: number) => {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            return dateStr < todayString
        },
        [viewYear, viewMonth, todayString]
    )

    const isWeekendColumn = (cellIndex: number) => {
        const col = cellIndex % 7
        return col === 5 || col === 6
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <BookingStepHeader title="Choose date" />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                {/* Business name */}
                <AppText className="text-[18px] font-poppins-semibold text-brand mb-4">Grooming Center</AppText>

                {/* Select Date label */}
                <AppText className="text-[16px] font-poppins text-brand mb-4">Select Date</AppText>

                {/* Month navigation */}
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable onPress={handlePrevMonth} className="p-2" accessibilityRole="button">
                        <Feather name="chevron-left" size={20} color="#0C2A63" />
                    </Pressable>
                    <AppText className="text-[16px] font-poppins-semibold text-brand">
                        {MONTHS[viewMonth]} {viewYear}
                    </AppText>
                    <Pressable onPress={handleNextMonth} className="p-2" accessibilityRole="button">
                        <Feather name="chevron-right" size={20} color="#0C2A63" />
                    </Pressable>
                </View>

                {/* Weekday headers */}
                <View className="flex-row mb-2">
                    {WEEKDAY_LABELS.map((label, idx) => {
                        const isWeekend = idx === 5 || idx === 6
                        return (
                            <View key={label} className="flex-1 items-center">
                                <AppText className={`text-[12px] font-poppins-medium ${isWeekend ? 'text-brand' : 'text-text-muted'}`}>
                                    {label}
                                </AppText>
                            </View>
                        )
                    })}
                </View>

                {/* Calendar grid */}
                <View className="flex-row flex-wrap mb-6">
                    {calendarDays.map((day, idx) => {
                        if (day == null) {
                            return <View key={`empty-${idx}`} style={{ width: '14.28%', aspectRatio: 1 }} />
                        }

                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isSelected = selectedDate === dateStr
                        const isPast = isPastDay(day)
                        const isWeekend = isWeekendColumn(idx)

                        return (
                            <View key={dateStr} style={{ width: '14.28%', aspectRatio: 1 }}>
                                <Pressable
                                    onPress={() => !isPast && handleSelectDate(day)}
                                    disabled={isPast}
                                    className={`flex-1 items-center justify-center rounded-full m-0.5 ${isSelected ? 'bg-orange' : ''}`}
                                    accessibilityRole="button"
                                >
                                    <AppText
                                        className={`text-[14px] font-poppins-medium ${
                                            isSelected ? 'text-white' : isPast ? 'text-text-muted/40' : isWeekend ? 'text-brand' : 'text-text'
                                        }`}
                                    >
                                        {day}
                                    </AppText>
                                </Pressable>
                            </View>
                        )
                    })}
                </View>

                {/* Time slots */}
                {selectedDate && (
                    <View>
                        <AppText className="text-[16px] font-poppins-semibold text-brand mb-3">Select Time</AppText>
                        <AppText className="text-[14px] font-poppins-medium text-brand mb-3 text-center">{formatSelectedDate(selectedDate)}</AppText>
                        <TimeSlotPicker slots={slots} selectedSlot={selectedTimeSlot} onSelectSlot={handleSelectSlot} isLoading={isLoadingSlots} />
                    </View>
                )}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8" style={{ zIndex: 10, elevation: 10 }}>
                <AppButton title="Continue" onPress={handleContinue} disabled={!selectedDate || !selectedTimeSlot} className="bg-brand]" />
            </View>
        </SafeAreaView>
    )
}

export default SelectDateTimeScreen
