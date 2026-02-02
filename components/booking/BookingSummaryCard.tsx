import React from 'react'
import { View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import type { PublicServiceDto } from '@/store/features/public-business/publicBusiness.types'

type BookingSummaryCardProps = {
    businessName: string
    services: PublicServiceDto[]
    dateLabel: string
    timeLabel: string
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

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ businessName, services, dateLabel, timeLabel }) => {
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0)
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)

    return (
        <View className="rounded-2xl border border-border bg-white p-4">
            <AppText className="text-[16px] font-poppins-semibold text-[#0C2A63] mb-3">{businessName}</AppText>

            <View className="gap-2 mb-3">
                {services.map((service) => (
                    <View key={service.id} className="flex-row items-center justify-between">
                        <AppText className="text-[14px] text-[#0C2A63]">{service.name}</AppText>
                        <View className="flex-row items-center gap-2">
                            <AppText className="text-[13px] text-text-muted">{formatDuration(service.duration)}</AppText>
                            <AppText className="text-[14px] font-poppins-medium text-brand">{formatPrice(service.price)}</AppText>
                        </View>
                    </View>
                ))}
            </View>

            <View className="border-t border-border pt-3 gap-2">
                <View className="flex-row items-center gap-2">
                    <Feather name="calendar" size={16} color="#8896AB" />
                    <AppText className="text-[14px] text-[#0C2A63]">{dateLabel}</AppText>
                </View>
                <View className="flex-row items-center gap-2">
                    <Feather name="clock" size={16} color="#8896AB" />
                    <AppText className="text-[14px] text-[#0C2A63]">{timeLabel}</AppText>
                </View>
            </View>

            <View className="border-t border-border mt-3 pt-3 flex-row items-center justify-between">
                <AppText className="text-[14px] text-text-muted">Total ({formatDuration(totalDuration)})</AppText>
                <AppText className="text-[18px] font-poppins-semibold text-brand">{formatPrice(totalPrice)}</AppText>
            </View>
        </View>
    )
}
