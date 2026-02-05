import React from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'

export enum BookingStatus {
    NEW = 'new',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export type BookingService = {
    name: string
    price?: number
}

export type Booking = {
    id: string
    businessId: string
    customer: { firstName: string; lastName: string; avatarUrl?: string | null }
    services: BookingService[]
    totalPrice: number
    dateLabel: string
    timeLabel: string
    status: BookingStatus
    hasReview?: boolean
}

type Props = {
    booking: Booking
    onPress?: () => void
}

const statusConfig: Record<BookingStatus, { label: string; bg: string; text: string }> = {
    [BookingStatus.NEW]: { label: 'New', bg: 'bg-[#FFF3E0]', text: 'text-[#E89F48]' },
    [BookingStatus.CONFIRMED]: { label: 'Confirmed', bg: 'bg-[#E8EAF6]', text: 'text-[#0C2A63]' },
    [BookingStatus.COMPLETED]: { label: 'Completed', bg: 'bg-[#E8F5E9]', text: 'text-[#27AE60]' },
    [BookingStatus.CANCELLED]: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-[#FF4D4D]' },
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

export const BookingCard = ({ booking, onPress }: Props) => {
    const { customer, services, totalPrice, dateLabel, timeLabel, status } = booking
    const fullName = `${customer.firstName} ${customer.lastName}`
    const badge = statusConfig[status]

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

            {/* Services */}
            <View className="mt-3">
                <AppText className="text-[12px] text-text-muted">Services</AppText>
                {services.map((s, i) => (
                    <View key={i} className="mt-1 flex-row items-center justify-between">
                        <AppText className="font-poppins-medium text-[14px] text-[#0C2A63]">{s.name}</AppText>
                        {s.price != null && <AppText className="font-poppins-medium text-[14px] text-[#0C2A63]">{formatPrice(s.price)}</AppText>}
                    </View>
                ))}
            </View>

            {/* Total */}
            <View className="mt-2 flex-row items-center justify-between border-t border-[#E5E7EB] pt-2">
                <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">Total</AppText>
                <AppText className="font-poppins-semibold text-[16px] text-[#0C2A63]">{formatPrice(totalPrice)}</AppText>
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
