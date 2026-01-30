import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { ServiceForm, ServiceFormValues } from '@/src/components/forms/ServiceForm'

const CreateServiceScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const handleSubmit = async (values: ServiceFormValues) => {
        console.log(values)
        router.back()
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F6F7FB]">
            <View className="flex-1">
                <View className="relative items-center justify-center px-6 pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-6 h-14 w-14 items-center justify-center rounded-full border border-[#C9CEDA] bg-transparent"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, { top: 10 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Create service</AppText>

                    <View className="absolute right-6 h-14 w-14" style={{ top: 10 }} />
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ServiceForm onSubmit={handleSubmit} />
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default CreateServiceScreen
