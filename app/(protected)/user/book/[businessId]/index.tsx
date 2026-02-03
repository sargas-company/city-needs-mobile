import React, { useMemo, useState } from 'react'
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { ReviewList } from '@/components/reviews/ReviewList'
import type { Review } from '@/components/reviews/ReviewCard'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { initBookingFlow } from '@/store/features/booking-flow/bookingFlow.slice'
import { useAppDispatch } from '@/store/hooks'

// TODO: replace with real API data when GET /businesses/:id is ready
const mockBusiness = {
    name: 'Grooming Center',
    city: 'Saskatoon',
    rating: 4.5,
    price: '$25/hour',
    time: '10:00 – 18:00',
    category: 'Pets',
    serviceType: 'On Site & Studio',
    description:
        'Grooming Center is a space dedicated to the care and comfort of your pets. We specialize in professional grooming, offering a safe, gentle, and personalized experience for every animal. Our groomers work with all breeds, using high-quality tools and modern grooming techniques.',
    provider: { name: 'Sarah Johnson', role: 'Manager', phone: '+1 306 555 0199' },
    avatarUrl: null,
}

// TODO: replace with real API data
const mockReviews: Review[] = [
    {
        id: '1',
        authorName: 'Dale Thiel',
        authorAvatarUrl: null,
        rating: 5,
        comment:
            'The staff were so gentle and caring with my dog, and the result was beyond expectations. Everything was clean, calm, and very professional.\nMy pup came back happy, relaxed, and looking amazing. I\u2019ll definitely be coming back and recommending this place to all my friends!',
        createdAt: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        authorName: 'Emily Carter',
        authorAvatarUrl: null,
        rating: 5,
        comment: 'Booking was easy, the staff were friendly and professional, and they handled my pet with so much care.',
        createdAt: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
]

type TabKey = 'about' | 'reviews'

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

const BusinessDetailScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState<TabKey>('about')
    const [callModalVisible, setCallModalVisible] = useState(false)
    const [smsModalVisible, setSmsModalVisible] = useState(false)

    const phoneRaw = mockBusiness.provider.phone.replace(/\s/g, '')

    const handleCall = () => {
        setCallModalVisible(false)
        Linking.openURL(`tel:${phoneRaw}`)
    }

    const handleSms = () => {
        setSmsModalVisible(false)
        Linking.openURL(`sms:${phoneRaw}`)
    }

    const businessInitial = useMemo(() => (mockBusiness.name ? mockBusiness.name[0].toUpperCase() : '?'), [])
    const providerInitial = useMemo(() => (mockBusiness.provider.name ? mockBusiness.provider.name[0].toUpperCase() : '?'), [])
    const descriptionParagraphs = useMemo(() => mockBusiness.description.split('\n').filter(Boolean), [])

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
                            uri={mockBusiness.avatarUrl ?? undefined}
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

                    <AppText className="mt-4 text-center text-[22px] font-poppins-bold text-[#0C2A63]">{mockBusiness.name}</AppText>

                    <View className="mt-2 flex-row items-center gap-2">
                        <Feather name="map-pin" size={16} color="#FF4D4D" />
                        <AppText className="text-[13px] font-poppins-medium text-[#171717]">{mockBusiness.city}</AppText>
                        <Feather name="star" size={16} color="#e89f48" />
                        <AppText className="text-[13px] font-poppins-medium text-[#171717]">({mockBusiness.rating})</AppText>
                    </View>
                </View>

                {/* Info cards */}
                <View className="mt-6 flex-row flex-wrap justify-between gap-3">
                    <InfoCard icon="dollar-sign" label="Price" value={mockBusiness.price} />
                    <InfoCard icon="clock" label="Time" value={mockBusiness.time} />
                    <InfoCard icon="tag" label="Category" value={mockBusiness.category} />
                    <InfoCard icon="layers" label="Service Type" value={mockBusiness.serviceType} />
                </View>

                {/* Tabs */}
                <View className="mt-8 flex-row items-center justify-center gap-10">
                    <TabButton title="About Us" active={activeTab === 'about'} onPress={() => setActiveTab('about')} />
                    <TabButton title="Reviews" active={activeTab === 'reviews'} onPress={() => setActiveTab('reviews')} />
                </View>

                {/* Tab content */}
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
                                        <AppText className="font-poppins-semibold text-[14px] text-[#171717]">{mockBusiness.provider.name}</AppText>
                                        <AppText className="font-poppins-medium text-[12px] text-[#CBCBCB]">{mockBusiness.provider.role}</AppText>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <AppPressable
                                        onPress={() => setSmsModalVisible(true)}
                                        className="h-11 w-11 items-center justify-center rounded-full bg-[#0C2A63]"
                                    >
                                        <Feather name="message-circle" size={20} color="#FFFFFF" />
                                    </AppPressable>
                                    <AppPressable
                                        onPress={() => setCallModalVisible(true)}
                                        className="h-11 w-11 items-center justify-center rounded-full bg-[#0C2A63]"
                                    >
                                        <Feather name="phone" size={20} color="#FFFFFF" />
                                    </AppPressable>
                                </View>
                            </View>
                        </View>

                        <View className="mt-4 rounded-2xl bg-white p-4" style={cardShadow}>
                            {descriptionParagraphs.map((paragraph, idx) => (
                                <AppText
                                    key={idx}
                                    className={`font-poppins-medium text-[14px] leading-[21px] text-[#171717] ${idx > 0 ? 'mt-3' : ''}`}
                                >
                                    {paragraph}
                                </AppText>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="mt-6">
                        <ReviewList reviews={mockReviews} />
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
                        <AppText className="mt-3 text-center text-[16px] font-poppins-medium text-[#171717]">{mockBusiness.provider.phone}</AppText>
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
                            Write to {mockBusiness.provider.phone}
                        </AppText>
                        <View className="mt-6">
                            <AppButton title="Message" onPress={handleSms} className="bg-[#0C2A63]" />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    )
}

export default BusinessDetailScreen
