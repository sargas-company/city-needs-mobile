import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { ProgressStepper } from '@/components/ui/ProgressStepper'

const CustomerServicesScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const { data: categories } = useGetCategoriesQuery()
    const categoryOptions = categories ?? []

    const {
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors },
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

    const steps = ['Address', 'Services']
    const currentStep = 2

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pb-6">
                <View className="w-full max-w-md self-center flex-1">
                    <View className="gap-6 flex-1">
                        <View className="gap-2">
                            <ProgressStepper steps={steps} currentStep={currentStep} showLabels showFooter />
                            <Text className="text-2xl text-center font-bold text-[#0C2A63]">What type of services are you interested in?</Text>
                            <Text className="text-sm text-center text-gray-600">Select one or more categories. You can change this later.</Text>
                            {!!errors.categoryIds?.message && (
                                <Text className="mt-1 text-center text-sm text-red-600">{errors.categoryIds.message}</Text>
                            )}
                        </View>

                        <View className="flex-1">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                overScrollMode="never"
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: 12 }}
                            >
                                <View className="gap-3">
                                    {categoryOptions.map((category) => (
                                        <CategoryCard
                                            key={category.id}
                                            label={category.title}
                                            selected={selectedIds.includes(category.id)}
                                            onPress={() => toggleCategory(category.id)}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View>
                            <AppButton title="Continue" onPress={handleSubmit(onSubmit)} loading={isLoading} disabled={isLoading} />
                            {/*{!!submitError && <Text className="mt-2 text-center text-sm text-red-600">{submitError}</Text>}*/}
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CustomerServicesScreen
