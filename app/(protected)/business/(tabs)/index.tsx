import React, { useCallback, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { ActivityChart } from '@/components/ui/ActivityChart'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { AppPressable } from '@/components/ui/AppPressable'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useAppDispatch } from '@/store/hooks'
import { logoutThunk } from '@/store/features/auth/auth.thunks'

const PERIOD_OPTIONS = ['Weekly', 'Monthly', 'Yearly']

const MOCK_CHART_DATA = [
    { month: 'Jan', views: 40, actions: 65 },
    { month: 'Feb', views: 55, actions: 70 },
    { month: 'Mar', views: 25, actions: 10 },
    { month: 'Apr', views: 50, actions: 60 },
    { month: 'May', views: 60, actions: 75 },
    { month: 'Jun', views: 55, actions: 45 },
    { month: 'Jul', views: 20, actions: 80 },
    { month: 'Aug', views: 50, actions: 65 },
]

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

const StatusRow = ({ label, variant, badgeLabel }: { label: string; variant: 'active' | 'expired' | 'inactive'; badgeLabel: string }) => (
    <View className="flex-row items-center justify-between">
        <AppText className="font-poppins-medium text-[15px] text-text">{label}</AppText>
        <StatusBadge label={badgeLabel} variant={variant} />
    </View>
)

export default function BusinessHomeScreen() {
    const router = useRouter()
    const [period, setPeriod] = useState('Monthly')

    const dispatch = useAppDispatch()

    const handleLogout = useCallback(async () => {
        await dispatch(logoutThunk()).unwrap()
    }, [dispatch])

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header row: action icon + title + avatar */}
                <View className="mb-6 flex-row items-center justify-between">
                    <AppPressable className="relative h-10 w-10 items-center justify-center rounded-xl bg-[#F0F3FB]">
                        <Feather name="mail" size={20} color="#0C2A63" />
                        <View className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-[1.5px] border-white bg-danger" />
                    </AppPressable>

                    <AppText className="font-poppins-semibold text-subtitle text-brand">Home</AppText>

                    <Avatar
                        size={40}
                        borderWidth={2}
                        borderColor="#FFFFFF"
                        uri="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                    />
                </View>

                {/* Business info card */}
                <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
                    <AppText className="mb-4 font-poppins-semibold text-[18px] text-text">Good Morning, Grooming Center!</AppText>
                    <View className="gap-3">
                        <StatusRow label="Profile" variant="active" badgeLabel="Active" />
                        <StatusRow label="Reels" variant="expired" badgeLabel="Expired" />
                    </View>
                </View>

                {/* Subscription card */}
                <View className="mt-3 rounded-2xl bg-white px-5 py-4" style={cardShadow}>
                    <StatusRow label="Subscription" variant="inactive" badgeLabel="Inactive" />
                </View>

                {/* Bookings */}
                <AppPressable
                    onPress={() => router.push('/(protected)/business/bookings' as never)}
                    className="mt-3 flex-row items-center justify-between rounded-2xl bg-white px-5 py-4"
                    style={cardShadow}
                >
                    <View className="flex-row items-center gap-3">
                        <Feather name="calendar" size={20} color="#0C2A63" />
                        <AppText className="font-poppins-medium text-[15px] text-text">Bookings</AppText>
                    </View>
                    <Feather name="chevron-right" size={20} color="#8D8C92" />
                </AppPressable>

                {/* Stats section */}
                <View className="mt-6 flex-row items-center justify-between">
                    <AppText className="font-poppins-bold text-[20px] text-brand">Stats</AppText>
                    <PeriodSelector value={period} options={PERIOD_OPTIONS} onChange={setPeriod} />
                </View>

                <View className="mt-4 flex-row gap-3">
                    <StatCard icon="eye" label="Profile views" value="1, 854" changePercent={12.5} />
                    <StatCard icon="zap" label="User actions" value="96" changePercent={-1.6} />
                </View>

                {/* Activity overview section */}
                <AppText className="mb-4 mt-8 font-poppins-bold text-[20px] text-brand">Activity overview</AppText>
                <ActivityChart data={MOCK_CHART_DATA} />

                <View>
                    <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
                        <Text>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
