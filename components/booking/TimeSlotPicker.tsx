import React from 'react'
import { ActivityIndicator, View } from 'react-native'

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
        <View className="flex-row flex-wrap">
            {slots.map((slot) => {
                const isSelected = selectedSlot === slot.startAt
                return (
                    <View key={slot.startAt} style={{ width: '33.33%', paddingHorizontal: 4, paddingVertical: 4 }}>
                        <AppPressable
                            onPress={() => onSelectSlot(slot.startAt)}
                            className={`rounded-xl py-3 items-center border ${isSelected ? 'border-orange bg-orange/20' : 'border-border bg-white'}`}
                        >
                            <AppText className={`text-[14px] font-poppins-medium ${isSelected ? 'text-orange' : 'text-brand'}`}>
                                {formatTime(slot.startAt)}
                            </AppText>
                        </AppPressable>
                    </View>
                )
            })}
        </View>
    )
}
