import React from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { AppButton } from '@/components/ui/AppButton'
import { AppBottomSheet } from '@/components/layout/AppBottomSheet'
import { BookingStatus, type Booking } from '@/components/bookings/BookingCard'

type Props = {
    isOpen: boolean
    booking: Booking | null
    onClose: () => void
    onConfirm?: () => void
    onCancel?: () => void
}

function getBookingActionVisibility(status: BookingStatus): { showConfirm: boolean; showCancel: boolean } {
    switch (status) {
        case BookingStatus.NEW:
            return { showConfirm: true, showCancel: true }
        case BookingStatus.CONFIRMED:
            return { showConfirm: false, showCancel: true }
        case BookingStatus.COMPLETED:
            return { showConfirm: false, showCancel: false }
        default:
            return { showConfirm: false, showCancel: false }
    }
}

const iconButtonStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
}

export const BookingDetailsSheet = ({ isOpen, booking, onClose, onConfirm, onCancel }: Props) => {
    if (!booking) return null

    const { customer, serviceName, price, currency, dateLabel, timeLabel, status } = booking
    const { showConfirm, showCancel } = getBookingActionVisibility(status)
    const fullName = `${customer.firstName} ${customer.lastName}`
    const displayPrice = currency === 'USD' ? `$${price}` : `${price} ${currency}`

    return (
        <AppBottomSheet isOpen={isOpen && !!booking} onClose={onClose}>
            <View className="px-6 pt-2">
                {/* Header: Order Status + Close */}
                <View className="mb-5 flex-row items-center justify-between">
                    <AppText className="font-poppins-bold text-[20px] text-brand">Order Status</AppText>
                    <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                        <Feather name="x" size={24} color="#171717" />
                    </Pressable>
                </View>

                {/* Customer row */}
                <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <Avatar
                            uri={customer.avatarUrl ?? undefined}
                            size={48}
                            borderWidth={0}
                            fallback={
                                <View className="flex-1 items-center justify-center bg-brand">
                                    <AppText className="font-poppins-semibold text-[18px] text-white">
                                        {customer.firstName.charAt(0).toUpperCase()}
                                    </AppText>
                                </View>
                            }
                        />
                        <AppText className="font-poppins-semibold text-[16px] text-text">{fullName}</AppText>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <Pressable
                            className="h-11 w-11 items-center justify-center rounded-full bg-white"
                            style={[iconButtonStyle, ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 })] as never}
                        >
                            <Feather name="message-circle" size={20} color="#0C2A63" />
                        </Pressable>
                        <Pressable
                            className="h-11 w-11 items-center justify-center rounded-full bg-white"
                            style={[iconButtonStyle, ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 })] as never}
                        >
                            <Feather name="phone" size={20} color="#0C2A63" />
                        </Pressable>
                    </View>
                </View>

                {/* Service + Price */}
                <View className="mb-3 flex-row items-end justify-between">
                    <View>
                        <AppText className="text-[12px] text-text-muted">Service</AppText>
                        <AppText className="font-poppins-semibold text-[15px] text-brand">{serviceName}</AppText>
                    </View>
                    <AppText className="font-poppins-semibold text-[16px] text-brand">{displayPrice}</AppText>
                </View>

                {/* Date + Time */}
                <View className="mb-6 flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                        <Feather name="calendar" size={14} color="#8D8C92" />
                        <AppText className="text-[13px] text-text-muted">{dateLabel}</AppText>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Feather name="clock" size={14} color="#8D8C92" />
                        <AppText className="text-[13px] text-text-muted">{timeLabel}</AppText>
                    </View>
                </View>

                {(showConfirm || showCancel) && (
                    <>
                        {/* Divider */}
                        <View className="mb-6 h-px bg-[#E5E7EB]" />

                        {/* Actions */}
                        <View className="gap-3">
                            {showConfirm && <AppButton title="Confirm Booking" onPress={onConfirm} />}
                            {showCancel && <AppButton title="Cancel Booking" variant="outline" onPress={onCancel} />}
                        </View>
                    </>
                )}
            </View>
        </AppBottomSheet>
    )
}
