import React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import type { AvailabilitySlot } from '@/store/features/public-business/publicBusiness.types'

type TimeSlotPickerProps = {
    slots: AvailabilitySlot[]
    selectedSlot: string | null
    onSelectSlot: (startAt: string) => void
    isLoading?: boolean
}

function formatTime(iso: string): string {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlot, onSelectSlot, isLoading }) => {
    if (isLoading) {
        return (
            <View className="items-center justify-center py-8">
                <ActivityIndicator />
            </View>
        )
    }

    if (slots.length === 0) {
        return (
            <View className="items-center justify-center py-8">
                <AppText className="text-text-muted text-[14px]">No available time slots for this date</AppText>
            </View>
        )
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-2">
                {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.startAt
                    return (
                        <AppPressable
                            key={slot.startAt}
                            onPress={() => onSelectSlot(slot.startAt)}
                            className={`rounded-xl px-4 py-3 border ${isSelected ? 'border-brand bg-brand/10' : 'border-border bg-white'}`}
                        >
                            <AppText className={`text-[14px] font-poppins-medium ${isSelected ? 'text-brand' : 'text-[#0C2A63]'}`}>
                                {formatTime(slot.startAt)}
                            </AppText>
                        </AppPressable>
                    )
                })}
            </View>
        </ScrollView>
    )
}
