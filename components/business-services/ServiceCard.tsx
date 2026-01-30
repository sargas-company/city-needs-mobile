import React from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'

type Props = {
    name: string
    price: number
    duration: number
    onEdit?: () => void
    onDelete?: () => void
}

export const ServiceCard = ({ name, price, duration, onEdit, onDelete }: Props) => {
    const displayPrice = `$${(price / 100).toFixed(0)}`
    const displayDuration = `${duration} min`

    return (
        <View className="flex-row items-center rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
            <View className="flex-1">
                <View className="flex-row items-center gap-2">
                    <AppText className="font-poppins-semibold text-[16px] text-[#0C2A63]">{name}</AppText>
                    <AppText className="font-poppins-semibold text-[16px] text-[#0C2A63]">{displayPrice}</AppText>
                </View>
                <AppText className="mt-1 font-poppins text-[13px] text-[#3B82F6]">{displayDuration}</AppText>
            </View>

            <View className="flex-row items-center gap-3">
                {onDelete && (
                    <Pressable onPress={onDelete} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                        <Feather name="trash-2" size={20} color="#0C2A63" />
                    </Pressable>
                )}
                {onEdit && (
                    <Pressable onPress={onEdit} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                        <Feather name="edit-2" size={20} color="#0C2A63" />
                    </Pressable>
                )}
            </View>
        </View>
    )
}
