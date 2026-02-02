import React from 'react'
import { View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

export default function BusinessReelsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-white ">
            <AppText className="font-poppins-semibold text-subtitle text-brand">Reels</AppText>
            <AppText className="mt-2 text-text-muted">Coming soon</AppText>
        </View>
    )
}
