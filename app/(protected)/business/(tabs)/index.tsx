import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/AppText'
import { useAppSelector } from '@/store/hooks'
// import { useGetAnalyticsActivityQuery, useGetAnalyticsSummaryQuery } from '@/store/features/analytics/analyticsApi'
import { selectBusiness } from '@/store/features/profile/profile.selectors'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { ActivityChart } from '@/components/ui/ActivityChart'
import { AppPressable } from '@/components/ui/AppPressable'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const PERIOD_OPTIONS = ['Weekly', 'Monthly', 'Yearly']

const formatNumber = (num: number): string => num.toLocaleString('en-US')

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
    const business = useAppSelector(selectBusiness)
    // const { data: activityResponse } = useGetAnalyticsActivityQuery()
    // const { data: summaryResponse } = useGetAnalyticsSummaryQuery()

    // Hardcoded mock data
    const summary = {
        profileViews: { total: 0, deltaPercent: 0 },
        userActions: { total: 0, deltaPercent: 0 },
    }
    const chartData = [
        { month: 'Jan', views: 0, actions: 0 },
        { month: 'Feb', views: 0, actions: 0 },
        { month: 'Mar', views: 0, actions: 0 },
        { month: 'Apr', views: 0, actions: 0 },
        { month: 'May', views: 0, actions: 0 },
        { month: 'Jun', views: 0, actions: 0 },
    ]

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header row: action icon + title + avatar */}
                <View className="mb-6 flex-row items-center justify-between">
                    <AppPressable className="relative h-10 w-10 items-center justify-center rounded-xl bg-[#F0F3FB] opacity-0 pointer-events-none">
                        <Feather name="mail" size={20} color="#0C2A63" />
                        <View className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-[1.5px] border-white bg-danger" />
                    </AppPressable>

                    <AppText className="font-poppins-semibold text-subtitle text-brand">Home</AppText>

                    <AppPressable onPress={() => router.push('/(protected)/business/(tabs)/profile')}>
                        <Avatar
                            size={40}
                            borderWidth={2}
                            borderColor="#FFFFFF"
                            uri={business?.logo?.url ?? undefined}
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#E5E7EB]">
                                    <AppText className="text-[16px] font-poppins-bold text-[#0C2A63]">
                                        {(business?.name ?? 'B')[0].toUpperCase()}
                                    </AppText>
                                </View>
                            }
                        />
                    </AppPressable>
                </View>

                {/* Business info card */}
                <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
                    <AppText numberOfLines={1} className="mb-4 font-poppins-semibold text-[15px] text-text">
                        Good Morning, {business?.category?.title ?? 'Business'}!
                    </AppText>
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
                <View className="mt-6">
                    <AppText className="font-poppins-bold text-[20px] text-brand">Stats</AppText>
                </View>

                <View className="mt-4 flex-row gap-3">
                    <StatCard
                        icon="eye"
                        label="Profile views"
                        value={formatNumber(summary.profileViews.total)}
                        changePercent={summary.profileViews.deltaPercent}
                    />
                    <StatCard
                        icon="zap"
                        label="User actions"
                        value={formatNumber(summary.userActions.total)}
                        changePercent={summary.userActions.deltaPercent}
                    />
                </View>

                {/* Activity overview section */}
                <AppText className="mb-4 mt-8 font-poppins-bold text-[20px] text-brand">Activity overview</AppText>
                <ActivityChart data={chartData} />
            </ScrollView>
        </SafeAreaView>
    )
}
