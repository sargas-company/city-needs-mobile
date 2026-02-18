import React, { useCallback, useMemo, useState } from 'react'
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'

import { AppButton } from '@/components/ui/AppButton'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { ReviewList } from '@/components/reviews/ReviewList'
import { getTodayWeekday, WEEKDAYS } from '@/constants/isoWeekday'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { initBookingFlow } from '@/store/features/booking-flow/bookingFlow.slice'
import type { BusinessHoursDayDto } from '@/store/features/public-business/publicBusiness.types'
import { useGetBusinessHoursQuery, useGetPublicBusinessQuery } from '@/store/features/public-business/publicBusinessApi'
import { useGetBusinessReviewsQuery } from '@/store/features/reviews/reviewsApi'
import { useAppDispatch } from '@/store/hooks'
import { DoubleStar } from '@/components/ui/DoubleMoon'
import { AnalyticsActionType, useTrackAnalytics } from '@/hooks/useTrackAnalytics'

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
    return getDayLabel(day)
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

type TabKey = 'about' | 'reviews'

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

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} className="items-center">
            <AppText className={`font-poppins-semibold text-[14px] ${active ? 'text-[#0C2A63]' : 'text-[#CBCBCB]'}`}>{title}</AppText>
            <View className={`mt-2 h-[3px] w-16 rounded-full ${active ? 'bg-[#0C2A63]' : 'bg-transparent'}`} />
        </Pressable>
    )
}

const VideoPlayerModal = ({ visible, onClose, videoUrl }: { visible: boolean; onClose: () => void; videoUrl: string }) => {
    const player = useVideoPlayer(videoUrl, (p) => {
        p.loop = false
        p.play()
    })

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 items-center justify-center bg-black/90" onPress={onClose}>
                <Pressable className="w-full aspect-video" onPress={(e) => e.stopPropagation()}>
                    <VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="contain" nativeControls allowsFullscreen />
                </Pressable>
                <Pressable onPress={onClose} className="absolute top-12 right-6 h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Feather name="x" size={24} color="#FFFFFF" />
                </Pressable>
            </Pressable>
        </Modal>
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

const BusinessDetailScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { trackUserAction } = useTrackAnalytics()
    const [activeTab, setActiveTab] = useState<TabKey>('about')
    const [callModalVisible, setCallModalVisible] = useState(false)
    const [smsModalVisible, setSmsModalVisible] = useState(false)
    const [whatsappModalVisible, setWhatsappModalVisible] = useState(false)
    const [reviewCursor, setReviewCursor] = useState<string | null>(null)
    const [hoursModalVisible, setHoursModalVisible] = useState(false)
    const [videoModalVisible, setVideoModalVisible] = useState(false)

    const { data: publicData } = useGetPublicBusinessQuery(businessId!, { skip: !businessId })
    const { data: businessHours } = useGetBusinessHoursQuery(businessId!, { skip: !businessId })

    const isReviewsTab = activeTab === 'reviews'
    const {
        data: reviewsData,
        isLoading: reviewsLoading,
        isFetching: reviewsFetching,
    } = useGetBusinessReviewsQuery({ businessId: businessId!, cursor: reviewCursor }, { skip: !businessId || !isReviewsTab })

    const reviews = useMemo(
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
        if (next && !reviewsFetching) setReviewCursor(next)
    }, [reviewsData?.meta?.nextCursor, reviewsFetching])

    const businessName = publicData?.name ?? 'Business'
    const businessCity = publicData?.address?.city ?? ''
    const businessAvatarUrl = publicData?.logo?.url ?? null
    const businessInitial = businessName[0].toUpperCase()
    const ratingAvg = publicData?.ratingAvg ?? 0

    const priceLabel = publicData?.price != null ? `$${publicData.price}` : '—'
    const timeLabel = getTodayHoursLabel(businessHours)
    const categoryLabel = publicData?.category?.title ?? '—'
    const serviceFlags = getServiceFlagsFromBusiness(publicData as Record<string, unknown> | undefined)
    const serviceTypeLabel = getServiceTypeLabel(serviceFlags.onSite, serviceFlags.inStudio)

    const phoneRaw = (publicData?.phone ?? '').replace(/\s/g, '')

    const handleCall = () => {
        setCallModalVisible(false)
        if (phoneRaw) {
            trackUserAction({
                businessId: businessId!,
                actionType: AnalyticsActionType.CALL,
            })
            Linking.openURL(`tel:${phoneRaw}`)
        }
    }

    const handleSms = () => {
        setSmsModalVisible(false)
        if (phoneRaw) {
            trackUserAction({
                businessId: businessId!,
                actionType: AnalyticsActionType.MESSAGE,
            })
            Linking.openURL(`sms:${phoneRaw}`)
        }
    }

    const handleWhatsapp = () => {
        setWhatsappModalVisible(false)
        if (phoneRaw) {
            trackUserAction({
                businessId: businessId!,
                actionType: AnalyticsActionType.MESSAGE,
            })
            const phoneForWhatsapp = phoneRaw.replace(/^\+/, '')
            Linking.openURL(`https://wa.me/${phoneForWhatsapp}`)
        }
    }

    const providerInitial = businessName[0].toUpperCase()
    const businessPhotos = publicData?.photos ?? []
    const businessVideo = publicData?.video
    const isVideoReady = businessVideo?.processedUrl && businessVideo?.thumbnailUrl
    const descriptionParagraphs = useMemo(() => (publicData?.description ?? '').split('\n').filter(Boolean), [publicData?.description])

    const handleBookNow = () => {
        if (!businessId) return
        dispatch(initBookingFlow({ businessId }))
        router.push(`/(protected)/user/book/${businessId}/select-services`)
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Back button */}
                <View className="flex-row justify-start mb-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>
                </View>

                {/* Avatar + name + location */}
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
                                <Feather name="map-pin" size={16} color="#e89f48" />
                                <AppText className="text-[13px] font-poppins-medium text-[#171717]">{businessCity}</AppText>
                            </>
                        ) : null}
                        <DoubleStar />
                        <AppText className="text-[13px] font-poppins-medium text-[#171717]">({ratingAvg})</AppText>
                    </View>
                </View>

                {/* Info cards */}
                <View className="mt-6 flex-row flex-wrap justify-between gap-3">
                    <InfoCard icon="dollar-sign" label="Price" value={priceLabel} />
                    <InfoCard icon="clock" label="Time Today" value={timeLabel} onPress={() => setHoursModalVisible(true)} />
                    <InfoCard icon="tag" label="Category" value={categoryLabel} />
                    <InfoCard icon="layers" label="Service Type" value={serviceTypeLabel} />
                </View>

                {/* Tabs */}
                <View className="mt-8 flex-row items-center justify-center gap-10">
                    <TabButton title="About Us" active={activeTab === 'about'} onPress={() => setActiveTab('about')} />
                    <TabButton title="Reviews" active={activeTab === 'reviews'} onPress={() => setActiveTab('reviews')} />
                </View>

                {/* Tab content */}
                {activeTab === 'about' && (
                    <View className="mt-6">
                        <View className="rounded-2xl bg-white p-4" style={cardShadow}>
                            <View className="flex-row items-center justify-between">
                                <AppText className="font-poppins-semibold text-[14px] text-[#0C2A63]">Provider Contact</AppText>
                                <View className="flex-row items-center gap-3">
                                    <AppPressable
                                        onPress={() => setSmsModalVisible(true)}
                                        className="h-8 w-8 items-center justify-center rounded-full bg-[#0C2A63]"
                                    >
                                        <Feather name="message-circle" size={16} color="#FFFFFF" />
                                    </AppPressable>
                                    <AppPressable
                                        onPress={() => setWhatsappModalVisible(true)}
                                        className="h-8 w-8 items-center justify-center rounded-full bg-[#0C2A63]"
                                    >
                                        <FontAwesome name="whatsapp" size={16} color="#FFFFFF" />
                                    </AppPressable>
                                    <AppPressable
                                        onPress={() => setCallModalVisible(true)}
                                        className="h-8 w-8 items-center justify-center rounded-full bg-[#0C2A63]"
                                    >
                                        <Feather name="phone" size={16} color="#FFFFFF" />
                                    </AppPressable>
                                </View>
                            </View>

                            <View className="mt-4 flex-row items-center gap-3">
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
                                    <AppText className="font-poppins-semibold text-[14px] text-[#171717]">{businessName}</AppText>
                                    <AppText className="font-poppins-medium text-[12px] text-[#CBCBCB]">Owner</AppText>
                                </View>
                            </View>
                        </View>

                        {(isVideoReady || businessPhotos.length > 0) && (
                            <View className="mt-4">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                                    {isVideoReady && businessVideo?.thumbnailUrl && (
                                        <Pressable onPress={() => setVideoModalVisible(true)} className="mx-1">
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
                                    {businessPhotos.map((photo) => (
                                        <View key={photo.id} className="mx-1">
                                            <Image
                                                source={{ uri: photo.url }}
                                                style={{ width: 140, height: 140, borderRadius: 16 }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                                transition={200}
                                                recyclingKey={`photo-${photo.id}`}
                                            />
                                        </View>
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
                )}
                {activeTab === 'reviews' && (
                    <View className="mt-6">
                        <ReviewList
                            reviews={reviews}
                            isLoading={reviewsLoading || reviewsFetching}
                            hasNextPage={reviewsHasNextPage}
                            onLoadMore={handleLoadMoreReviews}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Book Appointment button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8">
                <AppButton title="Book Appointment" onPress={handleBookNow} className="bg-[#0C2A63]" />
            </View>

            {/* Call modal */}
            <Modal visible={callModalVisible} transparent animationType="fade" onRequestClose={() => setCallModalVisible(false)}>
                <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={() => setCallModalVisible(false)}>
                    <Pressable className="mx-6 w-[85%] rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
                        <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">Call Provider</AppText>
                        <AppText className="mt-3 text-center text-[16px] font-poppins-medium text-[#171717]">{publicData?.phone ?? ''}</AppText>
                        <View className="mt-6 gap-3">
                            <AppButton title="Call" onPress={handleCall} className="bg-[#0C2A63]" />
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
                            Write to {publicData?.phone ?? ''}
                        </AppText>
                        <View className="mt-6">
                            <AppButton title="Message" onPress={handleSms} className="bg-[#0C2A63]" />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* WhatsApp modal */}
            <Modal visible={whatsappModalVisible} transparent animationType="fade" onRequestClose={() => setWhatsappModalVisible(false)}>
                <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={() => setWhatsappModalVisible(false)}>
                    <Pressable className="mx-6 w-[85%] rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
                        <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">WhatsApp</AppText>
                        <AppText className="mt-3 text-center text-[16px] font-poppins-medium text-[#171717]">
                            Message {publicData?.phone ?? ''} on WhatsApp
                        </AppText>
                        <View className="mt-6">
                            <AppButton title="Open WhatsApp" onPress={handleWhatsapp} className="bg-[#0C2A63]" />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <BusinessHoursModal visible={hoursModalVisible} onClose={() => setHoursModalVisible(false)} days={businessHours} />
            {businessVideo?.processedUrl && (
                <VideoPlayerModal visible={videoModalVisible} onClose={() => setVideoModalVisible(false)} videoUrl={businessVideo.processedUrl} />
            )}
        </SafeAreaView>
    )
}

export default BusinessDetailScreen
