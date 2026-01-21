import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'

import { FormInput } from '@/components/ui/FormInput'
import { AppButton } from '@/components/ui/AppButton'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { AppText } from '@/components/ui/AppText'

import { AddressFormValues, addressSchema } from './addressSchema'

export type AddressFormProps = {
    initialValues?: Partial<AddressFormValues>
    onSubmit: (values: AddressFormValues) => Promise<void> | void
    isSubmittingExternal?: boolean
    title?: string
    subtitle?: string
    submitLabel?: string
    currentStep: number
    steps: string[]
}

const defaultValues: AddressFormValues = {
    addressLine1: '',
    addressLine2: '',
    city: 'Regina',
    zip: '',
    countryCode: 'CA',
    countryName: 'Canada',
}

export const AddressForm = ({
    initialValues,
    onSubmit,
    isSubmittingExternal = false,
    title = 'Enter Your Address Details',
    subtitle = 'Provide your address details so customers can find you easily.',
    submitLabel = 'Continue',
    currentStep,
    steps,
}: AddressFormProps) => {
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: { ...defaultValues, ...(initialValues ?? {}) },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const isLoading = isSubmitting || isSubmittingExternal

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingBottom: 24,
                }}
                bottomOffset={24}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View className="w-full max-w-md self-center gap-6">
                    <View className="gap-2">
                        <ProgressStepper steps={steps} currentStep={currentStep} showLabels showFooter />
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-bold text-[#0C2A63]">{title}</Text>
                        </View>
                        <Text className="text-sm text-gray-600">{subtitle}</Text>
                    </View>

                    <View className="gap-4">
                        <FormInput<AddressFormValues>
                            control={control}
                            name="addressLine1"
                            label="Address Line 1"
                            required
                            placeholder="Address Line 1"
                            editable={!isLoading}
                        />

                        <FormInput<AddressFormValues>
                            control={control}
                            name="addressLine2"
                            label="Address Line 2"
                            placeholder="Address Line 2"
                            editable={!isLoading}
                        />

                        <FormInput<AddressFormValues> control={control} name="city" label="City" required placeholder="City" editable={!isLoading} />

                        <FormInput<AddressFormValues>
                            control={control}
                            name="zip"
                            label="ZIP/ Postal Code"
                            required
                            placeholder="ZIP/ Postal Code"
                            editable={!isLoading}
                            keyboardType={'number-pad'}
                        />

                        <View>
                            <AppText className={'mb-2 leading-[21px]'}>Country</AppText>
                            <View className="h-12 flex-row items-center justify-between rounded-[12px] border border-[#CBCBCB] bg-white px-3">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-lg">🇨🇦</Text>
                                    <Text className="text-[14px] text-[#171717]">Canada</Text>
                                </View>
                                <Text className="text-lg text-gray-400 mb-1 mr-2">⌄</Text>
                            </View>
                        </View>

                        <AppButton
                            title={isLoading ? 'Saving...' : submitLabel}
                            onPress={handleSubmit(onSubmit)}
                            loading={isLoading}
                            disabled={isLoading}
                            className="mt-2"
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}
