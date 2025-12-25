import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
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
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { AppButton } from '@/components/ui/AppButton'

const CustomerServicesScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, error: categoriesError } = useGetCategoriesQuery()

    const categoryOptions = categories ?? []

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
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
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
                    {categoryOptions.map((category) => (
                        <CategoryCard
                            key={category.id}
                            label={category.title}
                            selected={selectedIds.includes(category.id)}
                            onPress={() => toggleCategory(category.id)}
                        />
                    ))}
                </View>

                <View className="mt-auto">
                    <AppButton title={'Continue'} onPress={handleSubmit(onSubmit)} loading={isLoading} disabled={isLoading} className="mt-2" />

                    {!!submitError && <Text className="mt-2 text-center text-sm text-red-600">{submitError}</Text>}
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default CustomerServicesScreen
