import React, { useState } from 'react'
import { Pressable, ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

// TODO: replace with real business data
const mockBusiness = {
    name: 'Grooming Center',
    city: 'Saskatoon',
    rating: 4.5,
    avatarUrl: null,
}

const LeaveReviewScreen = () => {
    const router = useRouter()
    const [userRating, setUserRating] = useState(0)
    const [reviewText, setReviewText] = useState('')

    const businessInitial = mockBusiness.name ? mockBusiness.name[0].toUpperCase() : '?'

    const handleSubmit = () => {
        // TODO: call API to submit review
        router.back()
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Back button */}
                <View className="flex-row justify-start mb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>
                </View>

                {/* Avatar + name + location */}
                <View className="items-center">
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

                {/* Divider */}
                <View className="my-6 h-px bg-border" />

                {/* Rating section */}
                <AppText className="text-center text-[16px] font-poppins-medium text-[#8D8C92] mb-4">Your overall rating for the provider</AppText>

                <View className="items-center">
                    <StarRating rating={userRating} onChange={setUserRating} size={40} />
                </View>

                {/* Divider */}
                <View className="my-6 h-px bg-border" />

                {/* Review text */}
                <AppText className="text-[16px] font-poppins-medium text-[#8D8C92] mb-3">Add detailed review</AppText>

                <TextInput
                    value={reviewText}
                    onChangeText={setReviewText}
                    placeholder="Enter here"
                    placeholderTextColor="#CBCBCB"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="rounded-2xl border border-border px-4 py-3 text-[14px] font-poppins text-[#0C2A63] min-h-[140px]"
                />
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8">
                <AppButton title="Submit" onPress={handleSubmit} disabled={userRating === 0} className="bg-[#0C2A63]" />
            </View>
        </SafeAreaView>
    )
}

export default LeaveReviewScreen
