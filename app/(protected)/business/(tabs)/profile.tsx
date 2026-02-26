import React, { useCallback, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MediaGalleryModal } from '@/components/modals/MediaGalleryModal'
import { ReviewList } from '@/components/reviews/ReviewList'
import type { Review } from '@/components/reviews/ReviewCard'
import { AppText } from '@/components/ui/AppText'
import { AppPressable } from '@/components/ui/AppPressable'
import { Avatar } from '@/components/ui/Avatar'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { getTodayWeekday, WEEKDAYS } from '@/constants/isoWeekday'
import { logoutThunk } from '@/store/features/auth/auth.thunks'
import { selectBusiness, selectProfileUser } from '@/store/features/profile/profile.selectors'
import { BusinessVideoVerificationStatus, VideoProcessingStatus } from '@/store/features/profile/profile.types'
import type { BusinessHoursDayDto } from '@/store/features/public-business/publicBusiness.types'
import { useGetBusinessHoursQuery, useGetPublicBusinessQuery } from '@/store/features/public-business/publicBusinessApi'
import { useGetBusinessReviewsQuery } from '@/store/features/reviews/reviewsApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DoubleStar } from '@/components/ui/DoubleMoon'

type TabKey = 'about' | 'reviews' | 'services'

function getDayLabel(day?: BusinessHoursDayDto): string {
    if (!day || day.hours.length === 0) return 'Closed'
    if (day.hours.every((h) => h.isClosed)) return 'Closed'
    if (day.hours.some((h) => h.is24h)) return 'Round the clock'

    const slots = day.hours.filter((h) => !h.isClosed && h.startTime && h.endTime).map((h) => `${h.startTime} – ${h.endTime}`)

    return slots.length > 0 ? slots.join(', ') : 'Closed'
}

function getTodayHoursLabel(days?: BusinessHoursDayDto[]): string {
    if (!days?.length) return '—'
    const todayApi = getTodayWeekday()
    const day = days.find((d) => d.weekday === todayApi)
    return `${getDayLabel(day)}`
}

function getServiceTypeLabel(onSite?: boolean | string | null, inStudio?: boolean | string | null): string {
    const on = onSite === true || onSite === 'true'
    const inS = inStudio === true || inStudio === 'true'
    if (on && inS) return 'On Site & Studio'
    if (on) return 'On Site'
    if (inS) return 'In Studio'
    return '—'
}

function getServiceFlagsFromBusiness(obj: Record<string, unknown> | null | undefined): { onSite: boolean; inStudio: boolean } {
    const source = obj && typeof obj.data === 'object' && obj.data !== null ? (obj.data as Record<string, unknown>) : obj
    if (!source) return { onSite: false, inStudio: false }
    const onSite = source.serviceOnSite ?? source.service_on_site
    const inStudio = source.serviceInStudio ?? source.service_in_studio
    return {
        onSite: onSite === true || onSite === 'true',
        inStudio: inStudio === true || inStudio === 'true',
    }
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

const InfoCard = ({
    icon,
    label,
    value,
    onPress,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    label: string
    value: string
    onPress?: () => void
}) => {
    const Wrapper = onPress ? Pressable : View
    return (
        <Wrapper className="w-[48%] rounded-2xl bg-white px-4 py-3" style={cardShadow} {...(onPress ? { onPress } : {})}>
            <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F0F3FB]">
                    <Feather name={icon} size={18} color="#0C2A63" />
                </View>
                <AppText className="font-poppins-medium text-[12px] text-[#8D8C92]">{label}</AppText>
            </View>
            <AppText className="mt-2 font-poppins-semibold text-[14px] text-[#0C2A63]">{value}</AppText>
        </Wrapper>
    )
}

const BusinessHoursModal = ({ visible, onClose, days }: { visible: boolean; onClose: () => void; days?: BusinessHoursDayDto[] }) => {
    const todayApi = getTodayWeekday()
    const daysMap = useMemo(() => {
        const map = new Map<number, BusinessHoursDayDto>()
        days?.forEach((d) => map.set(d.weekday, d))
        return map
    }, [days])

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onClose}>
                <Pressable className="mx-6 w-[90%] rounded-3xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
                    <View className="flex-row items-center justify-between mb-5">
                        <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Working Hours</AppText>
                        <Pressable onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-[#F0F3FB]">
                            <Feather name="x" size={18} color="#0C2A63" />
                        </Pressable>
                    </View>

                    {WEEKDAYS.map(({ weekday, label }) => {
                        const isToday = weekday === todayApi
                        const day = daysMap.get(weekday)
                        const timeText = getDayLabel(day)

                        return (
                            <View
                                key={weekday}
                                className={`flex-row items-center justify-between rounded-xl px-4 py-3 ${isToday ? 'bg-[#F0F3FB]' : ''}`}
                            >
                                <AppText
                                    className={`text-[14px] ${isToday ? 'font-poppins-semibold text-[#0C2A63]' : 'font-poppins-medium text-[#171717]'}`}
                                >
                                    {isToday ? `${label} (Today)` : label}
                                </AppText>
                                <AppText
                                    className={`text-[14px] ${
                                        timeText === 'Closed'
                                            ? 'font-poppins-medium text-[#FF4D4D]'
                                            : isToday
                                              ? 'font-poppins-semibold text-[#0C2A63]'
                                              : 'font-poppins-medium text-[#171717]'
                                    }`}
                                >
                                    {timeText}
                                </AppText>
                            </View>
                        )
                    })}
                </Pressable>
            </Pressable>
        </Modal>
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
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState<TabKey>('about')
    const [reviewsCursor, setReviewsCursor] = useState<string | null>(null)
    const [hoursModalVisible, setHoursModalVisible] = useState(false)
    const [mediaGalleryVisible, setMediaGalleryVisible] = useState(false)
    const [initialMediaIndex, setInitialMediaIndex] = useState(0)

    const business = useAppSelector(selectBusiness)
    const profileUser = useAppSelector(selectProfileUser)

    const { data: publicData } = useGetPublicBusinessQuery(business?.id!, { skip: !business?.id })
    const { data: businessHours } = useGetBusinessHoursQuery(business?.id!, { skip: !business?.id })

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
    const timeLabel = getTodayHoursLabel(businessHours)
    const categoryLabel = business?.category?.title ?? '—'
    const serviceSource = (publicData ?? business) as Record<string, unknown> | undefined
    const serviceFlags = getServiceFlagsFromBusiness(serviceSource)
    const serviceTypeLabel = getServiceTypeLabel(serviceFlags.onSite, serviceFlags.inStudio)

    const providerName = profileUser?.username ?? profileUser?.email ?? 'Owner'
    const providerInitial = providerName[0].toUpperCase()

    const businessPhotos = publicData?.photos ?? []
    const businessVideo = business?.video
    const isVideoReady =
        businessVideo?.processingStatus === VideoProcessingStatus.READY &&
        businessVideo?.status === BusinessVideoVerificationStatus.APPROVED &&
        businessVideo?.processedUrl
    const descriptionParagraphs = useMemo(() => (business?.description ?? '').split('\n').filter(Boolean), [business?.description])

    const mediaItems = useMemo(() => {
        const items: ({ type: 'video'; url: string } | { type: 'photo'; url: string; id: string })[] = []
        if (isVideoReady && businessVideo?.processedUrl) {
            items.push({ type: 'video', url: businessVideo.processedUrl })
        }
        businessPhotos.forEach((photo) => {
            items.push({ type: 'photo', url: photo.url, id: photo.id })
        })
        return items
    }, [isVideoReady, businessVideo?.processedUrl, businessPhotos])

    const openMediaGallery = useCallback((index: number) => {
        setInitialMediaIndex(index)
        setMediaGalleryVisible(true)
    }, [])

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

    const onLogout = async () => {
        await dispatch(logoutThunk()).unwrap()
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row justify-between">
                    <Pressable onPress={onLogout} className="flex-row items-center gap-2">
                        <Feather name="log-out" size={18} color="#FF4D4D" />
                        <AppText className="font-poppins-medium text-[13px] text-[#FF4D4D]">Log out</AppText>
                    </Pressable>
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

                        <View className="absolute bottom-1 right-1 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e89f48] opacity-0 pointer-events-none">
                            <Feather name="check" size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <AppText className="mt-4 text-center text-[22px] font-poppins-bold text-[#0C2A63]">{businessName}</AppText>

                    <View className="mt-2 flex-row items-center gap-2">
                        {businessCity ? (
                            <>
                                <Feather name="map-pin" size={16} color="#e89f48" />
                                <AppText className="text-[13px] font-poppins-medium text-[#171717]">{businessCity}</AppText>
                            </>
                        ) : null}
                        <DoubleStar />
                        <AppText className="text-[13px] font-poppins-medium text-[#171717]">({ratingAvg.toFixed(1)})</AppText>
                    </View>
                </View>

                <View className="mt-6 flex-row flex-wrap justify-between gap-3">
                    <InfoCard icon="dollar-sign" label="Price" value={priceLabel} />
                    <InfoCard icon="clock" label="Time Today" value={timeLabel} onPress={() => setHoursModalVisible(true)} />
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

                        {(isVideoReady || businessPhotos.length > 0) && (
                            <View className="mt-4">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                                    {isVideoReady && businessVideo?.thumbnailUrl && (
                                        <Pressable onPress={() => openMediaGallery(0)} className="mx-1">
                                            <Image
                                                source={{ uri: businessVideo.thumbnailUrl }}
                                                style={{ width: 100, height: 140, borderRadius: 16 }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                                transition={200}
                                            />
                                            <View className="absolute inset-0 items-center justify-center">
                                                <View className="h-12 w-12 items-center justify-center rounded-full bg-black/50">
                                                    <Feather name="play" size={24} color="#FFFFFF" />
                                                </View>
                                            </View>
                                        </Pressable>
                                    )}
                                    {businessPhotos.map((photo, index) => (
                                        <Pressable key={photo.id} className="mx-1" onPress={() => openMediaGallery(isVideoReady ? index + 1 : index)}>
                                            <Image
                                                source={{ uri: photo.url }}
                                                style={{ width: 140, height: 140, borderRadius: 16 }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                                transition={200}
                                                recyclingKey={`photo-${photo.id}`}
                                            />
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

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

            <BusinessHoursModal visible={hoursModalVisible} onClose={() => setHoursModalVisible(false)} days={businessHours} />
            {mediaGalleryVisible && mediaItems.length > 0 && (
                <MediaGalleryModal
                    visible={mediaGalleryVisible}
                    onClose={() => setMediaGalleryVisible(false)}
                    items={mediaItems}
                    initialIndex={initialMediaIndex}
                />
            )}
        </SafeAreaView>
    )
}

export default BusinessProfileScreen
