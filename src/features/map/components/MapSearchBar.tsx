import React, { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

const ORANGE = '#e89f48'
const ICON_DEFAULT = '#8D8C92'

export interface MapSearchBarProps {
    value: string
    onChangeText: (text: string) => void
    onSettingsPress?: () => void
    placeholder?: string
}

/**
 * Search bar for map screen.
 * White background, search icon (orange when focused), clear button, settings icon.
 */
export function MapSearchBar({ value, onChangeText, onSettingsPress, placeholder = 'Search' }: MapSearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)

    const iconColor = isFocused ? ORANGE : ICON_DEFAULT
    const borderColor = isFocused ? ORANGE : '#E5E7EB'

    const showClear = value.length > 0

    return (
        <View className="flex-row items-center gap-3 px-screen">
            <View
                className="flex-1 flex-row items-center rounded-xl border bg-white px-3"
                style={{
                    borderColor,
                    borderWidth: 1.5,
                    minHeight: 44,
                }}
            >
                <Feather name="search" size={18} color={iconColor} style={{ marginRight: 8 }} />

                <TextInput
                    className="flex-1 font-poppins text-base text-text"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="search"
                />

                {showClear && (
                    <Pressable hitSlop={8} onPress={() => onChangeText('')} className="ml-1 p-1">
                        <Feather name="x" size={18} color={ICON_DEFAULT} />
                    </Pressable>
                )}
            </View>

            <Pressable
                onPress={onSettingsPress}
                hitSlop={8}
                className="items-center justify-center rounded-xl bg-white p-2.5"
                style={{
                    borderWidth: 1.5,
                    borderColor: '#E5E7EB',
                }}
            >
                <Feather name="sliders" size={20} color={ORANGE} />
            </Pressable>
        </View>
    )
}
