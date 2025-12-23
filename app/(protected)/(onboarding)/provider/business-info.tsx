import { useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Dropdown } from 'react-native-element-dropdown'

import { BusinessHoursForm } from '@/components/forms/BusinessHoursForm'
import { BusinessInfoFormValues, businessInfoSchema } from '@/components/forms/businessInfoSchema'
import { FormInput } from '@/components/ui/FormInput'
import { FormPhoneInput } from '@/components/ui/FormPhoneInput'
import { CategoryType, useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus } from '@/store/features/profile/profile.selectors'
import { submitBusinessProfileThunk } from '@/store/features/onboarding/onboarding.thunks'

const ProviderBusinessInfo = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, error: categoriesError } = useGetCategoriesQuery()

    const formMethods = useForm<BusinessInfoFormValues>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: {
            businessName: '',
            categoryId: '',
            description: '',
            phone: '',
            email: '',
            businessHours: [
                { weekday: 0, isEnabled: true, startTime: '09:00', endTime: '18:00' },
                { weekday: 1, isEnabled: true, startTime: '09:00', endTime: '18:00' },
                { weekday: 2, isEnabled: true, startTime: '09:00', endTime: '18:00' },
                { weekday: 3, isEnabled: true, startTime: '09:00', endTime: '18:00' },
                { weekday: 4, isEnabled: true, startTime: '09:00', endTime: '18:00' },
                { weekday: 5, isEnabled: false },
                { weekday: 6, isEnabled: false },
            ],
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = formMethods

    const isLoading = isSubmitting || profileStatus === 'loading'
    const categoryOptions = categories ?? []
    const categoriesEmpty = categoryOptions.length === 0
    const categoriesPlaceholder = isCategoriesLoading ? 'Loading categories...' : categoriesEmpty ? 'No categories available' : 'Select category'
    const categoriesErrorMessage =
        (categoriesError as { data?: { message?: string } })?.data?.message ??
        (categoriesError as { error?: { data?: { message?: string } } })?.error?.data?.message ??
        (categoriesError as { message?: string })?.message ??
        (typeof categoriesError === 'string' ? categoriesError : null)

    const onSubmit = async (values: BusinessInfoFormValues) => {
        setSubmitError(null)
        try {
            await dispatch(submitBusinessProfileThunk(values)).unwrap()
            router.replace('/(protected)/(onboarding)/provider/address')
        } catch (err) {
            let message = 'Failed to save business info. Please try again.'
            if (typeof err === 'string') message = err
            else if (err instanceof Error && err.message) message = err.message
            setSubmitError(message)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FormProvider {...formMethods}>
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: 10,
                    }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    bottomOffset={24}
                    onScrollBeginDrag={Keyboard.dismiss}
                >
                    <View className="mt-4 mb-6">
                        <View className="mb-4 flex-row items-center">
                            <Pressable
                                onPress={() => router.back()}
                                className="mr-4 h-10 w-10 items-center justify-center rounded-full border border-gray-300"
                            >
                                <Text className="text-lg text-[#0C2A63]">{'‹'}</Text>
                            </Pressable>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-[#111827]">Your Progress</Text>
                                <View className="mt-3 flex-row items-center gap-2">
                                    <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                                    <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
                                    <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
                                </View>
                                <Text className="mt-2 text-sm font-medium text-[#0C2A63]">Step 1 of 3 · Business Info</Text>
                            </View>
                        </View>
                    </View>

                    <FormInput<BusinessInfoFormValues>
                        control={control}
                        name="businessName"
                        label="Business Name"
                        required
                        placeholder="Business Name"
                        editable={!isLoading}
                    />

                    <Controller
                        control={control}
                        name="categoryId"
                        render={({ field: { value, onChange }, fieldState: { error } }) => {
                            const isDropdownDisabled = isLoading || isCategoriesLoading || categoriesEmpty
                            return (
                                <View className="mb-4">
                                    <Text className="mb-2 text-sm font-semibold text-[#111827]">
                                        Category<Text className="text-[#171717]"> *</Text>
                                    </Text>

                                    <Dropdown
                                        data={categoryOptions}
                                        labelField="title"
                                        valueField="id"
                                        value={value}
                                        search
                                        searchPlaceholder="Search category"
                                        placeholder={categoriesPlaceholder}
                                        disable={isDropdownDisabled}
                                        onChange={(item: CategoryType) => {
                                            onChange(item.id)
                                        }}
                                        style={{
                                            height: 48,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: error ? '#EF4444' : '#CBCBCB',
                                            paddingHorizontal: 12,
                                            backgroundColor: '#ffffff',
                                        }}
                                        placeholderStyle={{
                                            fontSize: 14,
                                            color: '#9CA3AF',
                                        }}
                                        selectedTextStyle={{
                                            fontSize: 14,
                                            color: '#171717',
                                        }}
                                        inputSearchStyle={{
                                            fontSize: 14,
                                            color: '#171717',
                                        }}
                                        containerStyle={{
                                            borderRadius: 12,
                                            backgroundColor: '#ffffff',
                                        }}
                                    />

                                    {!!error && <Text className="mt-1 text-xs font-semibold text-[#EF4444]">{error.message}</Text>}
                                    {!!categoriesErrorMessage && isCategoriesError ? (
                                        <Text className="mt-1 text-xs font-semibold text-[#EF4444]">{categoriesErrorMessage}</Text>
                                    ) : null}
                                </View>
                            )
                        }}
                    />

                    <FormInput<BusinessInfoFormValues>
                        control={control}
                        name="description"
                        label="Description"
                        required
                        placeholder="Description"
                        editable={!isLoading}
                        multiline
                        numberOfLines={4}
                        inputWrapperClassName="items-start pt-3"
                    />

                    <FormPhoneInput<BusinessInfoFormValues> control={control} name="phone" label="Mobile Number" required />

                    <FormInput<BusinessInfoFormValues>
                        control={control}
                        name="email"
                        label="Email"
                        required
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                    />

                    <View className="mt-6">
                        <BusinessHoursForm />
                    </View>

                    <View className="mt-6">
                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className={`w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                        >
                            <Text className="text-base font-semibold text-white">Next</Text>
                        </Pressable>
                        {!!submitError && <Text className="mt-2 text-center text-sm text-red-600">{submitError}</Text>}
                    </View>
                </KeyboardAwareScrollView>
            </FormProvider>
        </SafeAreaView>
    )
}

export default ProviderBusinessInfo
