import React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

import { ReviewCard, type Review } from './ReviewCard'

type Props = {
    reviews: Review[]
    isLoading?: boolean
    hasNextPage?: boolean
    onLoadMore?: () => void
}

export const ReviewList = ({ reviews, isLoading, hasNextPage, onLoadMore }: Props) => {
    if (isLoading && reviews.length === 0) {
        return (
            <View className="py-6 items-center">
                <ActivityIndicator />
            </View>
        )
    }

    if (reviews.length === 0) {
        return (
            <View className="py-6">
                <AppText className="text-center font-poppins-medium text-[14px] text-[#8D8C92]">No reviews yet</AppText>
            </View>
        )
    }

    return (
        <View>
            {reviews.map((review, index) => (
                <View key={review.id}>
                    {index > 0 && <View className="h-px bg-[#E5E7EB]" />}
                    <ReviewCard review={review} />
                </View>
            ))}

            {hasNextPage && (
                <View className="py-4 items-center">
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <AppText onPress={onLoadMore} className="font-poppins-medium text-[14px] text-brand">
                            Load more
                        </AppText>
                    )}
                </View>
            )}
        </View>
    )
}
