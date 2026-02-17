import React, { useState } from 'react'
import { Alert, Keyboard, Pressable, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useGetPublicBusinessQuery } from '@/store/features/public-business/publicBusinessApi'
import { useCreateReviewMutation } from '@/store/features/reviews/reviewsApi'
import { DoubleStar } from '@/components/ui/DoubleMoon'

const LeaveReviewScreen = () => {
    const router = useRouter()
    const { businessId, bookingId } = useLocalSearchParams<{ businessId: string; bookingId: string }>()
    const [userRating, setUserRating] = useState(0)
    const [reviewText, setReviewText] = useState('')

    const { data: businessData } = useGetPublicBusinessQuery(businessId!)
    const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation()

    const businessName = businessData?.name ?? 'Business'
    const businessCity = businessData?.address?.city ?? ''
    const businessRating = businessData?.ratingAvg ?? 0
    const businessAvatarUrl = businessData?.logo?.url ?? null
    const businessInitial = businessName[0].toUpperCase()

    const handleSubmit = async () => {
        if (!bookingId) return
        try {
            await createReview({
                bookingId,
                rating: userRating,
                comment: reviewText.trim() || undefined,
            }).unwrap()
            router.back()
        } catch {
            Alert.alert('Error', 'Failed to submit review. Please try again.')
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAwareScrollView
                    contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bottomOffset={24}
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

                            <AppText className="text-[13px] font-poppins-medium text-[#171717]">({businessRating})</AppText>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className="my-6 h-px bg-border" />

                    {/* Rating section */}
                    <AppText className="text-center text-[16px] font-poppins-medium text-[#8D8C92] mb-4">
                        Your overall rating for the provider
                    </AppText>

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
                        maxLength={500}
                        className="rounded-2xl border border-border px-4 py-3 text-[14px] font-poppins text-[#0C2A63] min-h-[140px]"
                    />
                </KeyboardAwareScrollView>

                <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8">
                    <AppButton title="Submit" onPress={handleSubmit} disabled={userRating === 0} loading={isSubmitting} className="bg-[#0C2A63]" />
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default LeaveReviewScreen
