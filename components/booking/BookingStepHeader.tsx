import React from 'react'
import { Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'

type BookingStepHeaderProps = {
    title: string
    onBack?: () => void
}

export const BookingStepHeader: React.FC<BookingStepHeaderProps> = ({ title, onBack }) => {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    return (
        <View className="flex-row items-center justify-between px-6 mb-4">
            <Pressable
                onPress={handleBack}
                className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                accessibilityRole="button"
            >
                <Feather name="arrow-left" size={20} color="#0C2A63" />
            </Pressable>

            <View className="flex-1 items-center">
                <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">{title}</AppText>
            </View>

            <View className="h-11 w-11" />
        </View>
    )
}
