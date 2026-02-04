import React from 'react'
import { View } from 'react-native'
import Slider from '@react-native-community/slider'

import { AppText } from '@/components/ui/AppText'

type Props = {
    value: number
    onChange: (value: number) => void
}

const PRICE_LABELS = ['$100', '$500', '$1k', '$2k', '$3k', '$4k']

export function PriceFilter({ value, onChange }: Props) {
    return (
        <View className="mb-5">
            <View className="mb-2 flex-row items-center justify-between">
                <AppText className="text-subtitle font-poppins-semibold text-text">Price</AppText>
                {/*<View className="rounded-lg bg-brand/10 px-2 py-0.5">*/}
                {/*    <AppText className="text-status font-poppins-medium text-brand">CAD</AppText>*/}
                {/*</View>*/}
            </View>

            <AppText className="mb-2 text-body font-poppins-medium text-orange">Up to ${value.toLocaleString()}</AppText>

            <Slider
                minimumValue={100}
                maximumValue={4000}
                step={100}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#e89f48"
                maximumTrackTintColor="#CBCBCB"
                thumbTintColor="#e89f48"
            />

            <View className="mt-1 flex-row justify-between">
                {PRICE_LABELS.map((label) => (
                    <AppText key={label} className="text-[11px] text-text-muted">
                        {label}
                    </AppText>
                ))}
            </View>
        </View>
    )
}
