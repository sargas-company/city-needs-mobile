import React, { useMemo } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { ServiceForm, ServiceFormValues } from '@/components/forms/ServiceForm'
import { useGetBusinessServicesQuery, useUpdateBusinessServiceMutation } from '@/store/features/business/businessServicesApi'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const EditServiceScreen = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { id } = useLocalSearchParams<{ id: string }>()

    const { data, isLoading: isLoadingList } = useGetBusinessServicesQuery()
    const [updateService, { isLoading: isUpdating }] = useUpdateBusinessServiceMutation()

    const service = useMemo(() => data?.data.find((s) => s.id === id), [data, id])

    const initialValues = useMemo<Partial<ServiceFormValues> | undefined>(() => {
        if (!service) return undefined
        return {
            name: service.name,
            price: service.price / 100,
            durationMinutes: service.duration,
        }
    }, [service])

    const handleSubmit = async (values: ServiceFormValues) => {
        if (!id) return
        try {
            await updateService({
                id,
                data: {
                    name: values.name,
                    price: Math.round(values.price * 100),
                    duration: values.durationMinutes,
                },
            }).unwrap()
            router.back()
        } catch {
            Alert.alert('Error', 'Failed to update service. Please try again.')
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

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Edit Service</AppText>

                    <View className="absolute right-6 h-14 w-14" style={{ top: 10 }} />
                </View>

                {isLoadingList || !initialValues ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <ServiceForm onSubmit={handleSubmit} isSubmittingExternal={isUpdating} initialValues={initialValues} submitLabel="Save" />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    )
}

export default EditServiceScreen
