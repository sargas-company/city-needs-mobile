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
    const dollars = cents / 100
    return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m} min` : `${h}h`
}

export const ServiceSelectCard: React.FC<ServiceSelectCardProps> = ({ name, price, duration, selected, onToggle }) => {
    return (
        <AppPressable onPress={onToggle} className="flex-row items-start py-3">
            <View
                className={`mt-0.5 h-7 w-7 items-center justify-center rounded-lg border-2 ${selected ? 'border-brand bg-brand' : 'border-[#CBCBCB] bg-white'}`}
            >
                {selected && <Feather name="check" size={18} color="#FFFFFF" />}
            </View>

            <View className="flex-1 ml-3">
                <View className="flex-row items-center gap-2">
                    <AppText className="text-[15px] font-poppins-medium text-[#0C2A63]">{name}</AppText>
                    <AppText className="text-[15px] font-poppins-semibold text-[#0C2A63]">{formatPrice(price)}</AppText>
                </View>
                <AppText className="text-[13px] text-[#CBCBCB] mt-0.5">{formatDuration(duration)}</AppText>
            </View>
        </AppPressable>
    )
}
