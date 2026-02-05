import { View } from 'react-native'
import React from 'react'

import MoonYellow from '@/assets/images/moon/moon_yellow.svg'
import MoonHalfGray from '@/assets/images/moon/moon_half.svg'

export const DoubleStar = () => {
    return (
        <View className={'flex flex-row gap-1'}>
            <MoonYellow width={12} height={12} />
            <MoonHalfGray width={12} height={12} />
        </View>
    )
}
