import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'

import { CategoryCard } from '@/components/ui/CategoryCard'
import { CustomerServicesFormValues, customerServicesSchema } from '@/components/forms/customerServicesSchema'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus } from '@/store/features/profile/profile.selectors'
import { submitCustomerCategoriesThunk } from '@/store/features/onboarding/onboarding.thunks'

export type CategoryOption = {
    id: string
    name: string
}

export const fallbackCategories: CategoryOption[] = [
    { id: 'a9a5e867-d30b-4b1e-a2cb-62142445e674', name: 'Beauty & Wellness' },
    { id: '4167790d-ccb1-4c39-8822-4a271a72be8a', name: 'Cleaning' },
    { id: '6072083f-de0a-4733-a01c-636115a4bba6', name: 'Pet Care' },
    { id: '51311644-5397-489d-a994-088cdb9b26a3', name: 'Home Repairs' },
    { id: '7758feb9-a4f4-4f6b-8d29-3ec7514a7652', name: 'Delivery & Assistance' },
    { id: '3fe68b0a-332b-434e-8156-ed8700c52700', name: 'Other' },
]

const CustomerServicesScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<CustomerServicesFormValues>({
        resolver: zodResolver(customerServicesSchema),
        defaultValues: { categoryIds: [] },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const selectedIds = watch('categoryIds') ?? []
    const isLoading = isSubmitting || profileStatus === 'loading'

    const toggleCategory = (id: string) => {
        const current = selectedIds
        const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
        setValue('categoryIds', next, { shouldValidate: true })
    }

    const onSubmit = async (values: CustomerServicesFormValues) => {
        setSubmitError(null)
        try {
            await dispatch(submitCustomerCategoriesThunk(values.categoryIds)).unwrap()
            router.replace('/(protected)/(tabs)')
        } catch (err) {
            let message = 'Failed to save services. Please try again.'
            if (typeof err === 'string') message = err
            else if (err instanceof Error && err.message) message = err.message
            setSubmitError(message)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
            >
                <View className="mt-4 mb-6 flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-4 h-10 w-10 items-center justify-center rounded-full border border-gray-300"
                        accessibilityRole="button"
                    >
                        <Text className="text-lg text-[#0C2A63]">‹</Text>
                    </Pressable>
                    <View className="flex-1">
                        <View className="h-2 w-full rounded-full bg-gray-200">
                            <View className="h-2 rounded-full bg-[#0C2A63]" style={{ width: '100%' }} />
                        </View>
                    </View>
                    <Text className="ml-3 text-sm font-semibold text-[#0C2A63]">2/2</Text>
                </View>

                <View className="mb-6 items-center">
                    <Text className="text-center text-xl font-bold text-[#0C2A63]">What type of services are you interested in?</Text>
                </View>

                <View className="mb-6">
                    {fallbackCategories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            label={category.name}
                            selected={selectedIds.includes(category.id)}
                            onPress={() => toggleCategory(category.id)}
                        />
                    ))}
                </View>

                <View className="mt-auto">
                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className={`mt-2 w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-base font-semibold text-white">Continue</Text>
                    </Pressable>
                    {!!submitError && <Text className="mt-2 text-center text-sm text-red-600">{submitError}</Text>}
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default CustomerServicesScreen
