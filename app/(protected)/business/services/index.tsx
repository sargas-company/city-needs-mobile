import React from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'

type Service = {
    id: string
    name: string
    price: number
    durationMinutes: number
}

const services: Service[] = []

const MyServicesScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const contentPaddingBottom = insets.bottom + 112

    return (
        <SafeAreaView className="flex-1 bg-white pt-[140px]">
            <View className="flex-1">
                <View className="relative items-center justify-center px-6 pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-6 h-14 w-14 items-center justify-center rounded-full border border-[#C9CEDA] bg-transparent"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, { top: 10 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">My services</AppText>

                    <View className="absolute right-6 h-14 w-14" style={{ top: 10 }} />
                </View>

                <View className="flex-1 items-center justify-center px-6" style={{ paddingBottom: contentPaddingBottom }}>
                    {services.length === 0 && (
                        <View className="items-center">
                            <View className="h-36 w-56 items-center justify-center rounded-2xl bg-[#EAF0FF]">
                                <View className="h-3 w-16 rounded-full bg-white opacity-70" />
                            </View>

                            <AppText className="mt-6 text-center text-[26px] font-poppins-semibold text-[#0C2A63]">No services yet</AppText>
                            <AppText className="mt-3 max-w-[270px] text-center text-[14px] font-poppins text-[#8E94A3]">
                                Create your first service to make it available for booking
                            </AppText>
                        </View>
                    )}
                </View>

                <View className="absolute left-0 right-0" style={{ bottom: insets.bottom + 16, paddingHorizontal: 24 }}>
                    <AppButton title="Add Service" onPress={() => router.push('/(protected)/business/services/create')} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default MyServicesScreen
