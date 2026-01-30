import React from 'react'
import { View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'

type StatCardProps = {
    icon: React.ComponentProps<typeof Feather>['name']
    label: string
    value: string
    changePercent: number
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, changePercent }) => {
    const isPositive = changePercent >= 0
    const changeColor = isPositive ? 'text-orange' : 'text-danger'
    const changeText = `${isPositive ? '+' : ''}${changePercent}%`

    return (
        <View className="flex-1 rounded-2xl bg-white p-4" style={cardShadow}>
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-[#F0F3FB]">
                <Feather name={icon} size={20} color="#0C2A63" />
            </View>
            <AppText className="font-poppins text-[13px] text-text-muted">{label}</AppText>
            <View className="mt-1 flex-row items-baseline gap-2">
                <AppText className="font-poppins-bold text-[22px] text-brand">{value}</AppText>
                <AppText className={`font-poppins-medium text-[12px] ${changeColor}`}>{changeText}</AppText>
            </View>
        </View>
    )
}
