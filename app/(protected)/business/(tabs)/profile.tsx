import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ReviewList } from '@/components/reviews/ReviewList'
import type { Review } from '@/components/reviews/ReviewCard'
import { AppText } from '@/components/ui/AppText'
import { AppPressable } from '@/components/ui/AppPressable'
import { Avatar } from '@/components/ui/Avatar'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import type { BusinessHoursDto } from '@/store/features/profile/profile.types'
import { selectBusiness, selectProfileUser } from '@/store/features/profile/profile.selectors'
import { useGetPublicBusinessQuery } from '@/store/features/public-business/publicBusinessApi'
import { useGetBusinessReviewsQuery } from '@/store/features/reviews/reviewsApi'
import { useAppSelector } from '@/store/hooks'

type TabKey = 'about' | 'reviews' | 'services'

function getTodayHoursLabel(hours?: BusinessHoursDto[] | null): string {
    if (!hours?.length) return '—'
    const today = new Date().getDay()
    const entry = hours.find((h) => h.weekday === today)
    if (!entry || entry.isClosed) return 'Closed'
    if (entry.is24h) return '24 hours'
    if (entry.startTime && entry.endTime) return `${entry.startTime} – ${entry.endTime}`
    return '—'
}

function getServiceTypeLabel(onSite?: boolean | null, inStudio?: boolean | null): string {
    if (onSite && inStudio) return 'On Site & Studio'
    if (onSite) return 'On Site'
    if (inStudio) return 'In Studio'
    return '—'
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

const InfoCard = ({ icon, label, value }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string }) => {
    return (
        <View className="w-[48%] rounded-2xl bg-white px-4 py-3" style={cardShadow}>
            <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F0F3FB]">
                    <Feather name={icon} size={18} color="#0C2A63" />
                </View>
                <AppText className="font-poppins-medium text-[12px] text-[#8D8C92]">{label}</AppText>
            </View>
            <AppText className="mt-2 font-poppins-semibold text-[14px] text-[#0C2A63]">{value}</AppText>
        </View>
    )
}

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} className="items-center">
            <AppText className={`font-poppins-semibold text-[14px] ${active ? 'text-[#0C2A63]' : 'text-[#CBCBCB]'}`}>{title}</AppText>
            <View className={`mt-2 h-[3px] w-16 rounded-full ${active ? 'bg-[#0C2A63]' : 'bg-transparent'}`} />
        </Pressable>
    )
}

const BusinessProfileScreen = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabKey>('about')
    const [reviewsCursor, setReviewsCursor] = useState<string | null>(null)

    const business = useAppSelector(selectBusiness)
    const profileUser = useAppSelector(selectProfileUser)

    const { data: publicData } = useGetPublicBusinessQuery(business?.id!, { skip: !business?.id })

    const isReviewsTab = activeTab === 'reviews'
    const {
        data: reviewsData,
        isLoading: reviewsLoading,
        isFetching: reviewsFetching,
    } = useGetBusinessReviewsQuery({ businessId: business?.id!, cursor: reviewsCursor }, { skip: !business?.id || !isReviewsTab })

    const businessName = business?.name ?? 'Business'
    const businessCity = business?.address?.city ?? ''
    const businessAvatarUrl = business?.logo?.url ?? null
    const businessInitial = businessName[0].toUpperCase()
    const ratingAvg = publicData?.ratingAvg ?? 0

    const priceLabel = business?.price != null ? `$${business.price}` : '—'
    const timeLabel = getTodayHoursLabel(business?.businessHours)
    const categoryLabel = business?.category?.title ?? '—'
    const serviceTypeLabel = getServiceTypeLabel(business?.serviceOnSite, business?.serviceInStudio)

    const providerName = profileUser?.username ?? profileUser?.email ?? 'Owner'
    const providerInitial = providerName[0].toUpperCase()

    const descriptionParagraphs = useMemo(() => (business?.description ?? '').split('\n').filter(Boolean), [business?.description])

    const reviews: Review[] = useMemo(
        () =>
            (reviewsData?.data ?? []).map((item) => ({
                id: item.id,
                authorName: item.authorName,
                rating: item.rating,
                comment: item.comment,
                createdAt: item.createdAt,
            })),
        [reviewsData?.data]
    )

    const reviewsHasNextPage = reviewsData?.meta?.hasNextPage ?? false

    const handleLoadMoreReviews = useCallback(() => {
        const next = reviewsData?.meta?.nextCursor
        if (next && !reviewsFetching) setReviewsCursor(next)
    }, [reviewsData?.meta?.nextCursor, reviewsFetching])

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row justify-end">
                    <Pressable onPress={() => router.push('/(protected)/business/edit-profile' as never)} className="flex-row items-center gap-2">
                        <Feather name="edit-3" size={18} color="#0C2A63" />
                        <AppText className="font-poppins-medium text-[13px] text-[#0C2A63]">Edit Profile</AppText>
                    </Pressable>
                </View>

                <View className="mt-2 items-center">
                    <View className="relative">
                        <Avatar
                            uri={businessAvatarUrl ?? undefined}
                            size={110}
                            borderColor="#F6F7FB"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#E5E7EB]">
                                    <AppText className="text-[40px] font-poppins-bold text-[#0C2A63]">{businessInitial}</AppText>
                                </View>
                            }
                        />

                        <View className="absolute bottom-1 right-1 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e89f48]">
                            <Feather name="check" size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <AppText className="mt-4 text-center text-[22px] font-poppins-bold text-[#0C2A63]">{businessName}</AppText>

                    <View className="mt-2 flex-row items-center gap-2">
                        {businessCity ? (
                            <>
                                <Feather name="map-pin" size={16} color="#FF4D4D" />
                                <AppText className="text-[13px] font-poppins-medium text-[#171717]">{businessCity}</AppText>
                            </>
                        ) : null}
                        <Feather name="star" size={16} color="#e89f48" />
                        <AppText className="text-[13px] font-poppins-medium text-[#171717]">({ratingAvg})</AppText>
                    </View>
                </View>

                <View className="mt-6 flex-row flex-wrap justify-between gap-3">
                    <InfoCard icon="dollar-sign" label="Price" value={priceLabel} />
                    <InfoCard icon="clock" label="Time" value={timeLabel} />
                    <InfoCard icon="tag" label="Category" value={categoryLabel} />
                    <InfoCard icon="layers" label="Service Type" value={serviceTypeLabel} />
                </View>

                <View className="mt-8 flex-row items-center justify-center gap-10">
                    <TabButton title="About Us" active={activeTab === 'about'} onPress={() => setActiveTab('about')} />
                    <TabButton title="Reviews" active={activeTab === 'reviews'} onPress={() => setActiveTab('reviews')} />
                    <TabButton title="Services" active={activeTab === 'services'} onPress={() => router.push('/(protected)/business/services')} />
                </View>

                {activeTab === 'about' ? (
                    <View className="mt-6">
                        <View className="rounded-2xl bg-white p-4" style={cardShadow}>
                            <AppText className="font-poppins-semibold text-[14px] text-[#0C2A63]">Provider Contact</AppText>

                            <View className="mt-4 flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <Avatar
                                        size={56}
                                        borderWidth={2}
                                        borderColor="#F6F7FB"
                                        fallback={
                                            <View className="flex-1 items-center justify-center bg-[#0C2A63]">
                                                <AppText className="text-[20px] font-poppins-bold text-white">{providerInitial}</AppText>
                                            </View>
                                        }
                                    />

                                    <View>
                                        <AppText className="font-poppins-semibold text-[14px] text-[#171717]">{providerName}</AppText>
                                        <AppText className="font-poppins-medium text-[12px] text-[#CBCBCB]">Owner</AppText>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <AppPressable className="h-11 w-11 items-center justify-center rounded-full bg-[#0C2A63]">
                                        <Feather name="message-circle" size={20} color="#FFFFFF" />
                                    </AppPressable>
                                    <AppPressable className="h-11 w-11 items-center justify-center rounded-full bg-[#0C2A63]">
                                        <Feather name="phone" size={20} color="#FFFFFF" />
                                    </AppPressable>
                                </View>
                            </View>
                        </View>

                        <View className="mt-4 rounded-2xl bg-white p-4" style={cardShadow}>
                            {descriptionParagraphs.length > 0 ? (
                                descriptionParagraphs.map((paragraph, idx) => (
                                    <AppText
                                        key={idx}
                                        className={`font-poppins-medium text-[14px] leading-[21px] text-[#171717] ${idx > 0 ? 'mt-3' : ''}`}
                                    >
                                        {paragraph}
                                    </AppText>
                                ))
                            ) : (
                                <AppText className="font-poppins-medium text-[14px] text-[#8D8C92]">No description</AppText>
                            )}
                        </View>
                    </View>
                ) : activeTab === 'reviews' ? (
                    <View className="mt-6">
                        <ReviewList
                            reviews={reviews}
                            isLoading={reviewsLoading || reviewsFetching}
                            hasNextPage={reviewsHasNextPage}
                            onLoadMore={handleLoadMoreReviews}
                        />
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    )
}

export default BusinessProfileScreen
