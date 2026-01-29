import React, { useMemo, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dropdown } from 'react-native-element-dropdown'

import { WaveHeader } from '@/components/layout/WaveHeader'
import { BusinessHoursForm } from '@/components/forms/BusinessHoursForm'
import { BusinessInfoFormValues, businessInfoSchema } from '@/components/forms/businessInfoSchema'
import { AddressFormValues, addressSchema } from '@/components/forms/addressSchema'
import { FormInput } from '@/components/ui/FormInput'
import { FormPhoneInput } from '@/components/ui/FormPhoneInput'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import type { CategoryType } from '@/store/api/categoriesApi'

const mockBusinessInfoDefaults: BusinessInfoFormValues = {
    businessName: 'Grooming Center',
    categoryId: 'pets',
    description: '',
    phone: '+1 (306) 555-1234',
    email: 'info@groomingcenter.com',
    price: '25',
    businessHours: [
        { weekday: 0, isEnabled: true, startTime: '10:00', endTime: '18:00' },
        { weekday: 1, isEnabled: true, startTime: '10:00', endTime: '18:00' },
        { weekday: 2, isEnabled: true, startTime: '10:00', endTime: '18:00' },
        { weekday: 3, isEnabled: true, startTime: '10:00', endTime: '18:00' },
        { weekday: 4, isEnabled: true, startTime: '10:00', endTime: '18:00' },
        { weekday: 5, isEnabled: false },
        { weekday: 6, isEnabled: false },
    ],
}

const mockAddressDefaults: AddressFormValues = {
    addressLine1: '123 1st Ave N',
    addressLine2: '',
    city: 'Saskatoon',
    zip: 'S7K 0J5',
    countryCode: 'CA',
    countryName: 'Canada',
    lat: 52.1332,
    lng: -106.67,
}

const categoryOptions: CategoryType[] = [
    { id: 'pets', title: 'Pets', slug: 'pets', description: null, requiresVerification: false, gracePeriodHours: null },
    { id: 'beauty', title: 'Beauty', slug: 'beauty', description: null, requiresVerification: false, gracePeriodHours: null },
]

const servicePillBase = 'flex-row items-center gap-2 rounded-checkbox border px-3 py-2'

const EditBusinessProfileScreen = () => {
    const router = useRouter()
    const businessForm = useForm<BusinessInfoFormValues>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: mockBusinessInfoDefaults,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const addressForm = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: mockAddressDefaults,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const [serviceOnSite, setServiceOnSite] = useState(true)
    const [serviceInStudio, setServiceInStudio] = useState(true)

    const businessInitial = useMemo(() => (mockBusinessInfoDefaults.businessName ? mockBusinessInfoDefaults.businessName[0].toUpperCase() : '?'), [])

    const handleSave = async () => {
        const isBusinessValid = await businessForm.trigger(undefined, { shouldFocus: true })
        const isAddressValid = await addressForm.trigger(undefined, { shouldFocus: true })
        if (!isBusinessValid || !isAddressValid) return

        const businessValues = businessForm.getValues()
        const addressValues = addressForm.getValues()

        const payload = {
            business: businessValues,
            serviceType: { onSite: serviceOnSite, inStudio: serviceInStudio },
            address: addressValues,
        }

        console.log('Saved (mock)', payload)
        Alert.alert('Saved (mock)')
    }

    return (
        <View className="flex-1 bg-[#F6F7FB]">
            <WaveHeader height={200} showLogo />

            <KeyboardAwareScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 110, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
            >
                <View className="mb-6 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-center text-[18px] font-poppins-semibold text-[#0C2A63]">Edit Profile</AppText>

                    <View className="h-11 w-11" />
                </View>

                <View className="items-center">
                    <View className="relative">
                        <Avatar
                            size={120}
                            borderColor="#F6F7FB"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#E5E7EB]">
                                    <AppText className="text-[40px] font-poppins-bold text-[#0C2A63]">{businessInitial}</AppText>
                                </View>
                            }
                        />

                        <Pressable className="absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                            <Feather name="camera" size={18} color="#0C2A63" />
                        </Pressable>
                    </View>

                    <Pressable className="mt-3" hitSlop={6}>
                        <AppText className="font-poppins-medium text-[13px] text-[#e89f48]">Change profile picture</AppText>
                    </Pressable>
                </View>

                <View className="mt-6 gap-4">
                    <FormProvider {...businessForm}>
                        <FormInput<BusinessInfoFormValues>
                            control={businessForm.control}
                            name="businessName"
                            label="Business Name"
                            required
                            placeholder="Business Name"
                        />

                        <FormPhoneInput<BusinessInfoFormValues> control={businessForm.control} name="phone" label="Mobile Number" required />

                        <Controller
                            control={businessForm.control}
                            name="categoryId"
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <View>
                                    <AppText className="mb-2 leading-[21px]">
                                        Category<AppText className="text-danger">*</AppText>
                                    </AppText>
                                    <Dropdown
                                        data={categoryOptions}
                                        labelField="title"
                                        valueField="id"
                                        value={value}
                                        placeholder="Select category"
                                        onChange={(item: CategoryType) => onChange(item.id)}
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
                                    {!!error && <AppText className="mt-1 text-xs font-poppins-semibold text-danger">{error.message}</AppText>}
                                </View>
                            )}
                        />

                        <FormInput<BusinessInfoFormValues>
                            control={businessForm.control}
                            name="price"
                            label="Price"
                            required
                            placeholder="$25/hour"
                            keyboardType="numeric"
                        />

                        <View className="mt-2">
                            <BusinessHoursForm />
                        </View>

                        <View className="mt-1">
                            <AppText className="mb-2 font-poppins-medium text-[14px] text-[#171717]">Service Type</AppText>
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => setServiceOnSite((prev) => !prev)}
                                    className={`${servicePillBase} ${serviceOnSite ? 'border-brand bg-brand' : 'border-border bg-white'}`}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: serviceOnSite }}
                                >
                                    {serviceOnSite ? <Feather name="check" size={16} color="#ffffff" /> : null}
                                    <AppText className={`${serviceOnSite ? 'text-white' : 'text-[#171717]'} font-poppins-medium text-[13px]`}>
                                        On Site
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    onPress={() => setServiceInStudio((prev) => !prev)}
                                    className={`${servicePillBase} ${serviceInStudio ? 'border-brand bg-brand' : 'border-border bg-white'}`}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: serviceInStudio }}
                                >
                                    {serviceInStudio ? <Feather name="check" size={16} color="#ffffff" /> : null}
                                    <AppText className={`${serviceInStudio ? 'text-white' : 'text-[#171717]'} font-poppins-medium text-[13px]`}>
                                        In Studio
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>

                        <FormInput<BusinessInfoFormValues>
                            control={businessForm.control}
                            name="description"
                            label="Description"
                            required
                            multiline
                            numberOfLines={4}
                            inputWrapperClassName="items-start h-auto"
                            inputClassName="min-h-[120px] text-[14px]"
                        />
                    </FormProvider>

                    <View className="h-px bg-border" />
                </View>

                <AppButton title="Save" onPress={handleSave} className="mt-8 bg-[#0C2A63]" textClassName="text-white" />
            </KeyboardAwareScrollView>
        </View>
    )
}

export default EditBusinessProfileScreen
