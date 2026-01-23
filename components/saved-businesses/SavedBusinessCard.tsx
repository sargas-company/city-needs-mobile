import React from 'react'
import { Image, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

type Props = {
    name: string
    city: string
    logoUrl?: string | null
}

export const SavedBusinessCard = ({ name, city, logoUrl }: Props) => {
    return (
        <View className="flex-row gap-4 rounded-2xl bg-white p-4">
            <View className="h-[64px] w-[64px] overflow-hidden rounded-xl bg-[#F6F7FB]">
                {logoUrl ? <Image source={{ uri: logoUrl }} className="h-full w-full" resizeMode="cover" /> : null}
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
