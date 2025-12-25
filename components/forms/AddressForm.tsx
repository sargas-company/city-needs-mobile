import { Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormInput } from '@/components/ui/FormInput'
import { AppButton } from '@/components/ui/AppButton'

import { AddressFormValues, addressSchema } from './addressSchema'

export type AddressFormProps = {
    initialValues?: Partial<AddressFormValues>
    onSubmit: (values: AddressFormValues) => Promise<void> | void
    isSubmittingExternal?: boolean
    title?: string
    subtitle?: string
    stepLabel?: string
    submitLabel?: string
}

const defaultValues: AddressFormValues = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
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
    stepLabel,
    submitLabel = 'Continue',
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
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    paddingBottom: 24,
                }}
                bottomOffset={24}
                keyboardShouldPersistTaps="handled" // было "always"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
                <View className="w-full max-w-md self-center gap-6">
                    <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-bold text-[#0C2A63]">{title}</Text>
                            {stepLabel ? <Text className="text-sm font-semibold text-[#0C2A63]">{stepLabel}</Text> : null}
                        </View>
                        <Text className="text-sm text-gray-600">{subtitle}</Text>
                        <View className="mt-2 h-2 w-full rounded-full bg-gray-200">
                            <View className="h-full w-1/2 rounded-full bg-[#0C2A63]" />
                        </View>
                    </View>

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
                        name="state"
                        label="State/ Province/ Region"
                        required
                        placeholder="State/ Province/ Region"
                        editable={!isLoading}
                    />

                    <FormInput<AddressFormValues>
                        control={control}
                        name="zip"
                        label="ZIP/ Postal Code"
                        required
                        placeholder="ZIP/ Postal Code"
                        editable={!isLoading}
                    />

                    <View className="h-12 flex-row items-center justify-between rounded-[12px] border border-[#CBCBCB] bg-white px-3">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-lg">🇨🇦</Text>
                            <Text className="text-[14px] text-[#171717]">Canada</Text>
                        </View>
                        <Text className="text-lg text-gray-400">⌄</Text>
                    </View>

                    <AppButton
                        title={isLoading ? 'Saving...' : submitLabel}
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={isLoading}
                        className="mt-2"
                    />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}
