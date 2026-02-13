import React, { useState } from 'react'
import { Linking, Modal, Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { AppButton } from '@/components/ui/AppButton'
import { AppBottomSheet } from '@/components/layout/AppBottomSheet'
import { BookingStatus, type Booking } from '@/components/bookings/BookingCard'
import { UserRole } from '@/store/features/profile/profile.types'

type Props = {
    isOpen: boolean
    booking: Booking | null
    role?: UserRole
    onClose: () => void
    onConfirm?: () => void
    onCancel?: () => void
    onLeaveReview?: () => void
}

type BookingActions = { primaryLabel: string | null; showCancel: boolean; showLeaveReview: boolean }

function getBookingActions(status: BookingStatus, role: UserRole, hasReview?: boolean): BookingActions {
    if (role === UserRole.END_USER) {
        switch (status) {
            case BookingStatus.NEW:
            case BookingStatus.CONFIRMED:
                return { primaryLabel: null, showCancel: true, showLeaveReview: false }
            case BookingStatus.COMPLETED:
                return { primaryLabel: null, showCancel: false, showLeaveReview: !hasReview }
            case BookingStatus.CANCELLED:
            default:
                return { primaryLabel: null, showCancel: false, showLeaveReview: false }
        }
    }

    // BUSINESS_OWNER role
    switch (status) {
        case BookingStatus.NEW:
            return { primaryLabel: 'Confirm Booking', showCancel: true, showLeaveReview: false }
        case BookingStatus.CONFIRMED:
            return { primaryLabel: 'Complete Booking', showCancel: true, showLeaveReview: false }
        case BookingStatus.COMPLETED:
        case BookingStatus.CANCELLED:
        default:
            return { primaryLabel: null, showCancel: false, showLeaveReview: false }
    }
}

const iconButtonStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
}

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

export const BookingDetailsSheet = ({ isOpen, booking, role = UserRole.END_USER, onClose, onConfirm, onCancel, onLeaveReview }: Props) => {
    const [callModalVisible, setCallModalVisible] = useState(false)
    const [smsModalVisible, setSmsModalVisible] = useState(false)

    if (!booking) return null

    const { customer, services, totalPrice, dateLabel, timeLabel, status, hasReview } = booking
    const { primaryLabel, showCancel, showLeaveReview } = getBookingActions(status, role, hasReview)
    const fullName = `${customer.firstName} ${customer.lastName}`
    const phoneRaw = (customer.phone ?? '').replace(/\s/g, '')

    const handleCall = () => {
        setCallModalVisible(false)
        if (phoneRaw) {
            Linking.openURL(`tel:${phoneRaw}`)
        }
    }

    const handleSms = () => {
        setSmsModalVisible(false)
        if (phoneRaw) {
            Linking.openURL(`sms:${phoneRaw}`)
        }
    }

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

                    {phoneRaw ? (
                        <View className="flex-row items-center gap-2">
                            <Pressable
                                onPress={() => setSmsModalVisible(true)}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white"
                                style={[iconButtonStyle, ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 })] as never}
                            >
                                <Feather name="message-circle" size={20} color="#0C2A63" />
                            </Pressable>
                            <Pressable
                                onPress={() => setCallModalVisible(true)}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white"
                                style={[iconButtonStyle, ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 })] as never}
                            >
                                <Feather name="phone" size={20} color="#0C2A63" />
                            </Pressable>
                        </View>
                    ) : null}
                </View>

                {/* Services */}
                <View className="mb-3">
                    <AppText className="text-[12px] text-text-muted">Services</AppText>
                    {services.map((s, i) => (
                        <View key={i} className="mt-1 flex-row items-center justify-between">
                            <AppText className="font-poppins-medium text-[14px] text-brand">{s.name}</AppText>
                            {s.price != null && <AppText className="font-poppins-medium text-[14px] text-brand">{formatPrice(s.price)}</AppText>}
                        </View>
                    ))}
                    <View className="mt-2 flex-row items-center justify-between border-t border-[#E5E7EB] pt-2">
                        <AppText className="font-poppins-semibold text-[15px] text-brand">Total</AppText>
                        <AppText className="font-poppins-semibold text-[16px] text-brand">{formatPrice(totalPrice)}</AppText>
                    </View>
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

                {(primaryLabel || showCancel || showLeaveReview) && (
                    <>
                        {/* Divider */}
                        <View className="mb-6 h-px bg-[#E5E7EB]" />

                        {/* Actions */}
                        <View className="gap-3">
                            {primaryLabel && <AppButton title={primaryLabel} onPress={onConfirm} />}
                            {showLeaveReview && (
                                <AppButton
                                    title="Leave Review"
                                    leftIcon={<Feather name="star" size={18} color="#FFFFFF" />}
                                    onPress={onLeaveReview}
                                />
                            )}
                            {showCancel && <AppButton title="Cancel Booking" variant="outline" onPress={onCancel} />}
                        </View>
                    </>
                )}

                {/* Call modal */}
                <Modal visible={callModalVisible} transparent animationType="fade" onRequestClose={() => setCallModalVisible(false)}>
                    <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={() => setCallModalVisible(false)}>
                        <Pressable className="mx-6 w-[85%] rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
                            <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">Call</AppText>
                            <AppText className="mt-3 text-center text-[16px] font-poppins-medium text-[#171717]">{customer.phone ?? ''}</AppText>
                            <View className="mt-6 gap-3">
                                <AppButton title="Call" onPress={handleCall} />
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* SMS modal */}
                <Modal visible={smsModalVisible} transparent animationType="fade" onRequestClose={() => setSmsModalVisible(false)}>
                    <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={() => setSmsModalVisible(false)}>
                        <Pressable className="mx-6 w-[85%] rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
                            <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">Write a Message</AppText>
                            <AppText className="mt-3 text-center text-[16px] font-poppins-medium text-[#171717]">
                                Write to {customer.phone ?? ''}
                            </AppText>
                            <View className="mt-6">
                                <AppButton title="Message" onPress={handleSms} />
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        </AppBottomSheet>
    )
}
