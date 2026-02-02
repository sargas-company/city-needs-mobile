import React from 'react'
import { View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'

type ServiceSelectCardProps = {
    name: string
    price: number
    duration: number
    selected: boolean
    onToggle: () => void
}

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export const ServiceSelectCard: React.FC<ServiceSelectCardProps> = ({ name, price, duration, selected, onToggle }) => {
    return (
        <AppPressable
            onPress={onToggle}
            className={`flex-row items-center rounded-2xl border px-4 py-4 ${selected ? 'border-brand bg-brand/5' : 'border-border bg-white'}`}
        >
            <View className="flex-1 mr-3">
                <AppText className="text-[16px] font-poppins-medium text-[#0C2A63]">{name}</AppText>
                <View className="flex-row items-center mt-1 gap-3">
                    <View className="flex-row items-center gap-1">
                        <Feather name="clock" size={14} color="#8896AB" />
                        <AppText className="text-[13px] text-text-muted">{formatDuration(duration)}</AppText>
                    </View>
                    <AppText className="text-[14px] font-poppins-semibold text-brand">{formatPrice(price)}</AppText>
                </View>
            </View>

            <View
                className={`h-6 w-6 items-center justify-center rounded-md border ${selected ? 'border-brand bg-brand' : 'border-border bg-white'}`}
            >
                {selected && <Feather name="check" size={16} color="#FFFFFF" />}
            </View>
        </AppPressable>
    )
}
