import React from 'react'
import { View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'

export type Review = {
    id: string
    authorName: string
    authorAvatarUrl?: string | null
    rating: number
    comment?: string | null
    createdAt: string
}

function formatTimeAgo(iso: string): string {
    const now = Date.now()
    const created = new Date(iso).getTime()
    const diffMs = now - created

    const minutes = Math.floor(diffMs / 60_000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`

    const years = Math.floor(months / 12)
    return `${years} year${years > 1 ? 's' : ''} ago`
}

type Props = {
    review: Review
}

export const ReviewCard = ({ review }: Props) => {
    const { authorName, authorAvatarUrl, rating, comment, createdAt } = review
    const initial = authorName ? authorName[0].toUpperCase() : '?'

    return (
        <View className="py-4">
            {/* Header: avatar + name/stars + time ago */}
            <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="relative">
                        <Avatar
                            uri={authorAvatarUrl ?? undefined}
                            size={48}
                            borderWidth={2}
                            borderColor="#F6F7FB"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#E5E7EB]">
                                    <AppText className="font-poppins-bold text-[18px] text-[#0C2A63]">{initial}</AppText>
                                </View>
                            }
                        />
                        <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-white bg-[#4A90D9]">
                            <Feather name="check" size={11} color="#FFFFFF" />
                        </View>
                    </View>

                    <View>
                        <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">{authorName}</AppText>
                        <StarRating rating={rating} readonly size={16} />
                    </View>
                </View>

                <AppText className="font-poppins-medium text-[12px] text-[#8D8C92]">{formatTimeAgo(createdAt)}</AppText>
            </View>

            {/* Comment */}
            {comment ? <AppText className="mt-3 font-poppins text-[14px] leading-[21px] text-[#8D8C92]">{comment}</AppText> : null}
        </View>
    )
}
