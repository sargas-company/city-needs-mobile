import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dropdown } from 'react-native-element-dropdown'

import { FormInput } from '@/components/ui/FormInput'
import { AppButton } from '@/components/ui/AppButton'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { AppText } from '@/components/ui/AppText'
import { AppInput } from '@/components/ui/AppInput'
import { AddressSearchItemDto, useAddressSearchQuery } from '@/store/api/locationApi'

import { AddressFormValues, CityKey, addressSchema, supportedCities } from './addressSchema'

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

const defaultValues: Partial<AddressFormValues> = {
    addressLine1: '',
    addressLine2: '',
    city: undefined,
    zip: '',
    countryCode: 'CA',
    countryName: 'Canada',
    lat: undefined,
    lng: undefined,
}

const cityOptions = supportedCities.map((city) => ({ label: city, value: city }))

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
    const initialFormValues = { ...defaultValues, ...(initialValues ?? {}) }
    const [addressSelected, setAddressSelected] = useState(
        () => !!initialFormValues.lat && !!initialFormValues.lng && !!initialFormValues.addressLine1 && !!initialFormValues.city
    )
    const [suggestions, setSuggestions] = useState<AddressSearchItemDto[]>([])
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const previousCityRef = useRef<CityKey | undefined>(initialFormValues.city as CityKey | undefined)

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        watch,
        setValue,
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: initialFormValues,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const selectedCity = watch('city')
    const addressLine1Value = watch('addressLine1')
    const zipValue = watch('zip')
    const latValue = watch('lat')
    const lngValue = watch('lng')

    const clearAddressSelection = useCallback(
        (clearAddressLine1 = false) => {
            setAddressSelected(false)
            setSuggestions([])
            setValue('zip', '', { shouldValidate: false })
            setValue('lat', undefined, { shouldValidate: false })
            setValue('lng', undefined, { shouldValidate: false })
            if (clearAddressLine1) {
                setValue('addressLine1', '', { shouldValidate: false })
            }
        },
        [setValue]
    )

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery((addressLine1Value ?? '').trim()), 300)
        return () => clearTimeout(handler)
    }, [addressLine1Value])

    useEffect(() => {
        if (previousCityRef.current !== undefined && selectedCity !== previousCityRef.current) {
            clearAddressSelection(true)
        }
        previousCityRef.current = selectedCity as CityKey | undefined
    }, [clearAddressSelection, selectedCity])

    useEffect(() => {
        if (!(addressLine1Value ?? '').trim()) {
            setSuggestions([])
        }
    }, [addressLine1Value])

    const canSearch = !!selectedCity && debouncedQuery.length >= 3 && !addressSelected
    const { data: searchData, isFetching: isSearching } = useAddressSearchQuery(
        { city: selectedCity as CityKey, query: debouncedQuery },
        { skip: !canSearch }
    )

    useEffect(() => {
        if (canSearch && searchData?.items) {
            setSuggestions(searchData.items)
        }
    }, [canSearch, searchData])

    useEffect(() => {
        if (!canSearch) {
            setSuggestions([])
        }
    }, [canSearch])

    const isLoading = isSubmitting || isSubmittingExternal
    const isSelectionValid = !!(selectedCity && addressSelected && zipValue && latValue !== undefined && lngValue !== undefined)

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
                        <Controller
                            control={control}
                            name="city"
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <View>
                                    <AppText className={'mb-2 leading-[21px]'}>
                                        City
                                        <AppText className="text-danger">*</AppText>
                                    </AppText>

                                    <Dropdown
                                        data={cityOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={value}
                                        placeholder="Select city"
                                        disable={isLoading}
                                        onChange={(item: { label: string; value: string }) => {
                                            if (item.value !== value) {
                                                clearAddressSelection(true)
                                            }
                                            onChange(item.value as CityKey)
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
                                        itemTextStyle={{
                                            fontSize: 14,
                                            color: '#171717',
                                        }}
                                        containerStyle={{
                                            borderRadius: 12,
                                            backgroundColor: '#ffffff',
                                        }}
                                    />

                                    {!!error && <Text className="mt-1 text-xs font-semibold text-red-500">{error.message}</Text>}
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="addressLine1"
                            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
                                const handleChangeText = (text: string) => {
                                    if (addressSelected) {
                                        clearAddressSelection(false)
                                    }
                                    onChange(text)
                                }

                                const handleSelectSuggestion = (item: AddressSearchItemDto) => {
                                    onChange(item.address.addressLine1)
                                    setValue('zip', item.address.zip ?? '', { shouldValidate: true })
                                    setValue('lat', item.location.lat, { shouldValidate: true })
                                    setValue('lng', item.location.lng, { shouldValidate: true })
                                    setAddressSelected(true)
                                    setSuggestions([])
                                }

                                const hasMinimumQuery = (value ?? '').trim().length >= 3
                                const showSuggestions =
                                    !addressSelected &&
                                    !!selectedCity &&
                                    hasMinimumQuery &&
                                    (isSearching || suggestions.length > 0 || (canSearch && searchData !== undefined))

                                return (
                                    <View>
                                        <AppInput
                                            label="Address Line 1"
                                            required
                                            placeholder="Address Line 1"
                                            value={value ?? ''}
                                            onChangeText={handleChangeText}
                                            onBlur={onBlur}
                                            editable={!isLoading}
                                            error={error?.message}
                                        />

                                        {showSuggestions && (
                                            <View className="mt-2 rounded-[12px] border border-[#CBCBCB] bg-white">
                                                {isSearching ? (
                                                    <Text className="px-3 py-3 text-sm text-gray-500">Searching...</Text>
                                                ) : (
                                                    <>
                                                        {suggestions.map((item) => (
                                                            <Pressable
                                                                key={item.placeId}
                                                                onPress={() => handleSelectSuggestion(item)}
                                                                className="border-b border-[#E5E7EB] px-3 py-3 last:border-b-0"
                                                            >
                                                                <Text className="text-sm text-[#171717]">{item.label}</Text>
                                                            </Pressable>
                                                        ))}

                                                        {suggestions.length === 0 ? (
                                                            <Text className="px-3 py-3 text-sm text-gray-500">No results found</Text>
                                                        ) : null}
                                                    </>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )
                            }}
                        />

                        <FormInput<AddressFormValues>
                            control={control}
                            name="addressLine2"
                            label="Address Line 2"
                            placeholder="Address Line 2"
                            editable={!isLoading}
                        />

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
                            disabled={isLoading || !isSelectionValid}
                            className="mt-2"
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}
