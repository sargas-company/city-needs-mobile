import React from 'react'
import { View, TextInput } from 'react-native'

import { AppText } from '@/components/ui/AppText'

type Props = {
    priceMin: number | null
    priceMax: number | null
    onPriceMinChange: (value: number | null) => void
    onPriceMaxChange: (value: number | null) => void
    disabled?: boolean
}

export function PriceFilter({ priceMin, priceMax, onPriceMinChange, onPriceMaxChange, disabled }: Props) {
    const handleMinChange = (text: string) => {
        const num = parseInt(text, 10)
        onPriceMinChange(isNaN(num) ? null : Math.max(0, num))
    }

    const handleMaxChange = (text: string) => {
        const num = parseInt(text, 10)
        onPriceMaxChange(isNaN(num) ? null : Math.max(0, num))
    }

    return (
        <View className="mb-5" style={disabled ? { opacity: 0.4 } : undefined}>
            <AppText className="mb-3 text-subtitle font-poppins-semibold text-text">Price Range</AppText>

            <View className="flex-row items-center gap-3">
                <View className="flex-1">
                    <AppText className="mb-1 text-caption text-text-muted">Min</AppText>
                    <View className="flex-row items-center rounded-xl border border-border bg-white px-3 py-2.5">
                        <AppText className="mr-1 text-body text-text-muted">$</AppText>
                        <TextInput
                            value={priceMin != null ? String(priceMin) : ''}
                            onChangeText={handleMinChange}
                            placeholder="0"
                            placeholderTextColor="#8D8C92"
                            keyboardType="number-pad"
                            editable={!disabled}
                            className="flex-1 text-body font-poppins-regular text-text"
                        />
                    </View>
                </View>

                <AppText className="mt-5 text-body text-text-muted">-</AppText>

                <View className="flex-1">
                    <AppText className="mb-1 text-caption text-text-muted">Max</AppText>
                    <View className="flex-row items-center rounded-xl border border-border bg-white px-3 py-2.5">
                        <AppText className="mr-1 text-body text-text-muted">$</AppText>
                        <TextInput
                            value={priceMax != null ? String(priceMax) : ''}
                            onChangeText={handleMaxChange}
                            placeholder="999"
                            placeholderTextColor="#8D8C92"
                            keyboardType="number-pad"
                            editable={!disabled}
                            className="flex-1 text-body font-poppins-regular text-text"
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}
