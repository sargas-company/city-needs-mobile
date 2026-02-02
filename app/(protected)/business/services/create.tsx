import React from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { ServiceForm, ServiceFormValues } from '@/components/forms/ServiceForm'
import { useCreateBusinessServiceMutation } from '@/store/features/business/businessServicesApi'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const CreateServiceScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [createService, { isLoading }] = useCreateBusinessServiceMutation()

    const handleSubmit = async (values: ServiceFormValues) => {
        try {
            await createService({
                name: values.name,
                price: Math.round(values.price * 100),
                duration: values.durationMinutes,
            }).unwrap()
            router.back()
        } catch {
            Alert.alert('Error', 'Failed to create service. Please try again.')
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1">
                <View className="relative items-center justify-center px-6 pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-6 h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Create service</AppText>

                    <View className="absolute right-6 h-14 w-14" style={{ top: 10 }} />
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ServiceForm onSubmit={handleSubmit} isSubmittingExternal={isLoading} />
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default CreateServiceScreen
