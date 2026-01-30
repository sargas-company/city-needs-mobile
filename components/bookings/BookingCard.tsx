import React from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'

export type BookingStatus = 'new' | 'confirmed' | 'completed'

export type Booking = {
    id: string
    customer: { firstName: string; lastName: string; avatarUrl?: string | null }
    serviceName: string
    price: number
    currency: string
    dateLabel: string
    timeLabel: string
    status: BookingStatus
}

type Props = {
    booking: Booking
    onPress?: () => void
}

const statusConfig: Record<BookingStatus, { label: string; bg: string; text: string }> = {
    new: { label: 'New', bg: 'bg-[#FFF3E0]', text: 'text-[#E89F48]' },
    confirmed: { label: 'Confirmed', bg: 'bg-[#E8EAF6]', text: 'text-[#0C2A63]' },
    completed: { label: 'Completed', bg: 'bg-[#E8F5E9]', text: 'text-[#27AE60]' },
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

export const BookingCard = ({ booking, onPress }: Props) => {
    const { customer, serviceName, price, currency, dateLabel, timeLabel, status } = booking
    const fullName = `${customer.firstName} ${customer.lastName}`
    const badge = statusConfig[status]

    const displayPrice = currency === 'USD' ? `$${price}` : `${price} ${currency}`

    const content = (
        <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
            {/* Top row: Avatar + Name | Status badge */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <Avatar
                        uri={customer.avatarUrl ?? undefined}
                        size={40}
                        borderWidth={0}
                        fallback={
                            <View className="flex-1 items-center justify-center bg-brand">
                                <AppText className="font-poppins-semibold text-[16px] text-white">
                                    {customer.firstName.charAt(0).toUpperCase()}
                                </AppText>
                            </View>
                        }
                    />
                    <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">{fullName}</AppText>
                </View>

                <View className={`rounded-pill px-3 py-1 ${badge.bg}`}>
                    <AppText className={`font-poppins-semibold text-[12px] ${badge.text}`}>{badge.label}</AppText>
                </View>
            </View>

            {/* Middle: Service + Price */}
            <View className="mt-3 flex-row items-center justify-between">
                <View>
                    <AppText className="text-[12px] text-text-muted">Service</AppText>
                    <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">{serviceName}</AppText>
                </View>
                <AppText className="font-poppins-semibold text-[16px] text-[#0C2A63]">{displayPrice}</AppText>
            </View>

            {/* Bottom: Date + Time */}
            <View className="mt-3 flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                    <Feather name="calendar" size={14} color="#8D8C92" />
                    <AppText className="text-[13px] text-text-muted">{dateLabel}</AppText>
                </View>
                <View className="flex-row items-center gap-1">
                    <Feather name="clock" size={14} color="#8D8C92" />
                    <AppText className="text-[13px] text-text-muted">{timeLabel}</AppText>
                </View>
            </View>
        </View>
    )

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                {content}
            </Pressable>
        )
    }

    return content
}
