import React from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'

import { AppText } from '@/components/ui/AppText'

type Props = {
    name: string
    city: string
    logoUrl?: string | null
    /** Optional key for image recycling in lists */
    recyclingKey?: string
}

export const SavedBusinessCard = ({ name, city, logoUrl, recyclingKey }: Props) => {
    const initial = name.charAt(0).toUpperCase()

    return (
        <View className="flex-row gap-4 rounded-2xl bg-white p-4">
            <View className="h-[64px] w-[64px] overflow-hidden rounded-xl bg-[#F6F7FB]">
                {logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        style={{ width: 64, height: 64 }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                        recyclingKey={recyclingKey}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center bg-[#A3C9A8]">
                        <AppText className="text-[24px] font-poppins-bold text-white">{initial}</AppText>
                    </View>
                )}
            </View>

            <View className="flex-1 justify-center gap-1">
                <AppText className="font-poppins-semibold text-[18px] leading-[24px] text-[#0C2A63]">{name}</AppText>

                <View className="flex-row items-center gap-2">
                    <AppText className="font-poppins-medium text-[13px] leading-[20px] text-[#171717]">{city}</AppText>
                </View>
            </View>
        </View>
    )
}
