import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { zodResolver } from '@hookform/resolvers/zod'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BusinessHoursForm } from '@/components/forms/BusinessHoursForm'
import { BusinessHoursFormItem } from '@/components/forms/businessHoursSchema'
import { BusinessInfoFormValues, businessInfoSchema } from '@/components/forms/businessInfoSchema'
import { AddressFormValues, addressSchema } from '@/components/forms/addressSchema'
import { FormInput } from '@/components/ui/FormInput'
import { FormPhoneInput } from '@/components/ui/FormPhoneInput'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import type { CategoryType } from '@/store/api/categoriesApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { authApi } from '@/store/features/auth/authApi'
import { resolveApiData } from '@/store/features/auth/auth.thunks'
import { useUpdateMyBusinessLogoMutation, useUpdateMyBusinessProfileMutation } from '@/store/features/business/businessApi'
import type { UpdateBusinessProfileDto } from '@/store/features/business/business.types'
import { selectBusiness, selectProfileUser } from '@/store/features/profile/profile.selectors'
import type { AppUser, BusinessHoursDto } from '@/store/features/profile/profile.types'
import { setProfileUser } from '@/store/features/profile/profile.slice'
import type { BusinessHoursDayDto } from '@/store/features/public-business/publicBusiness.types'
import { publicBusinessApi, useGetBusinessHoursQuery } from '@/store/features/public-business/publicBusinessApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { WEEKDAYS } from '@/constants/isoWeekday'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const mockBusinessInfoDefaults: BusinessInfoFormValues = {
    businessName: 'Grooming Center',
    categoryId: 'pets',
    description:
        'Grooming Center is a space dedicated to the care and comfort of your pets. We specialize in professional grooming, offering a safe, gentle, and personalized experience for every animal. Our groomers work with all breeds, using high-quality tools and modern grooming techniques.',
    phone: '+1 (306) 555-1234',
    email: 'info@groomingcenter.com',
    price: '25',
    businessHours: WEEKDAYS.map(({ weekday }) => ({
        weekday,
        isEnabled: weekday < 5,
        isClosed: weekday >= 5,
        is24h: false,
        startTime: weekday < 5 ? '10:00' : null,
        endTime: weekday < 5 ? '18:00' : null,
    })),
    serviceOnSite: true,
    serviceInStudio: true,
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
    {
        id: 'pets',
        title: 'Pets',
        slug: 'pets',
        description: null,
        requiresVerification: false,
        gracePeriodHours: null,
        imageUrl: null,
        bgColor: null,
    },
    {
        id: 'beauty',
        title: 'Beauty',
        slug: 'beauty',
        description: null,
        requiresVerification: false,
        gracePeriodHours: null,
        imageUrl: null,
        bgColor: null,
    },
]

const servicePillBase = 'flex-row items-center gap-2 rounded-checkbox border px-3 py-2'

const normalizeDigits = (val: string) => val.replace(/\D/g, '')

const parsePriceToInt = (val?: string | null) => {
    if (!val) return undefined
    const digits = val.replace(/[^0-9]/g, '')
    const num = digits ? parseInt(digits, 10) : NaN
    return Number.isFinite(num) ? num : undefined
}

/** Convert API hours (per-day with slots) to flat DTO for form. Uses first slot per day. */
const businessHoursDayDtoToFlat = (daysApi: BusinessHoursDayDto[]): BusinessHoursDto[] => {
    return WEEKDAYS.map(({ weekday }) => {
        const day = daysApi.find((d) => d.weekday === weekday)
        const slot = day?.hours?.find((h) => !h.isClosed) ?? day?.hours?.[0]
        if (!slot) {
            return { weekday, isClosed: true, is24h: false, startTime: null, endTime: null }
        }
        return {
            weekday,
            isClosed: slot.isClosed,
            is24h: slot.is24h ?? false,
            startTime: slot.is24h ? null : (slot.startTime ?? null),
            endTime: slot.is24h ? null : (slot.endTime ?? null),
        }
    })
}

const buildBusinessHoursDefaults = (days?: BusinessHoursDto[] | null): BusinessHoursFormItem[] => {
    const fallbackDay = (weekday: number): BusinessHoursFormItem => ({
        weekday,
        isEnabled: weekday < 5,
        isClosed: weekday >= 5,
        is24h: false,
        startTime: weekday < 5 ? '10:00' : null,
        endTime: weekday < 5 ? '18:00' : null,
    })

    const mapDay = (weekday: number): BusinessHoursFormItem => {
        const src = days?.find((d) => d.weekday === weekday)
        if (!src) return fallbackDay(weekday)
        const isClosed = src.isClosed ?? false
        const isEnabled = !isClosed
        const is24h = src.is24h ?? false
        return {
            weekday,
            isEnabled,
            isClosed,
            is24h,
            startTime: isEnabled && !is24h ? (src.startTime ?? null) : null,
            endTime: isEnabled && !is24h ? (src.endTime ?? null) : null,
        }
    }

    return WEEKDAYS.map(({ weekday }) => mapDay(weekday))
}

type PickedImage = {
    uri: string
    name: string
    type: string
}

const EditBusinessProfileScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const business = useAppSelector(selectBusiness)
    const profileUser = useAppSelector(selectProfileUser)

    console.log(business, '77777777')

    const { data: businessHoursApi } = useGetBusinessHoursQuery(business?.id ?? '', { skip: !business?.id })
    const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, error: categoriesError } = useGetCategoriesQuery()

    const [updateMyBusinessProfile, { isLoading: isUpdateProfileLoading }] = useUpdateMyBusinessProfileMutation()
    const [updateMyBusinessLogo, { isLoading: isUpdateLogoLoading }] = useUpdateMyBusinessLogoMutation()

    const [selectedLogo, setSelectedLogo] = useState<PickedImage | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const derivedBusinessDefaults = useMemo<BusinessInfoFormValues>(() => {
        const hoursSource = businessHoursApi?.length ? businessHoursDayDtoToFlat(businessHoursApi) : (business?.businessHours ?? null)
        return {
            businessName: business?.name ?? mockBusinessInfoDefaults.businessName,
            categoryId: business?.categoryId ?? mockBusinessInfoDefaults.categoryId,
            description: business?.description ?? mockBusinessInfoDefaults.description,
            phone: business?.phone ?? mockBusinessInfoDefaults.phone,
            email: business?.email ?? mockBusinessInfoDefaults.email,
            price: business?.price != null ? String(business.price) : mockBusinessInfoDefaults.price,
            businessHours: buildBusinessHoursDefaults(hoursSource),
            serviceOnSite: business?.serviceOnSite ?? true,
            serviceInStudio: business?.serviceInStudio ?? true,
        }
    }, [business, businessHoursApi])

    const businessForm = useForm<BusinessInfoFormValues>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: derivedBusinessDefaults,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const addressForm = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: mockAddressDefaults,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const {
        formState: { isSubmitting },
        watch,
        setValue,
    } = businessForm

    const serviceOnSite = watch('serviceOnSite')
    const serviceInStudio = watch('serviceInStudio')

    const isSaving = isSubmitting || isUpdateProfileLoading || isUpdateLogoLoading

    useEffect(() => {
        businessForm.reset(derivedBusinessDefaults)
    }, [businessForm, derivedBusinessDefaults])

    const businessInitial = useMemo(() => {
        const name = derivedBusinessDefaults.businessName || profileUser?.username || ''
        return name ? name[0].toUpperCase() : '?'
    }, [derivedBusinessDefaults.businessName, profileUser?.username])

    const currentLogoUri = selectedLogo?.uri || business?.logo?.url || undefined

    const handlePickLogo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false,
                quality: 0.8,
            })
            if (result.canceled || !result.assets?.length) return
            const asset = result.assets[0]
            const file: PickedImage = {
                uri: asset.uri,
                name: asset.fileName ?? 'logo.jpg',
                type: asset.mimeType ?? 'image/jpeg',
            }
            setSelectedLogo(file)
            await updateMyBusinessLogo(file).unwrap()
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
        } catch (err) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ??
                (err as { error?: { data?: { message?: string } } })?.error?.data?.message ??
                (err as { message?: string })?.message ??
                'Failed to update logo'
            setSubmitError(message)
        }
    }

    const mapBusinessHours = (days: BusinessHoursFormItem[]): BusinessHoursDto[] => {
        return days.map((day) => ({
            weekday: day.weekday,
            isClosed: !day.isEnabled,
            is24h: day.is24h ?? false,
            startTime: day.isEnabled && !(day.is24h ?? false) ? (day.startTime ?? null) : null,
            endTime: day.isEnabled && !(day.is24h ?? false) ? (day.endTime ?? null) : null,
        }))
    }

    const handleSave = async () => {
        setSubmitError(null)
        const isBusinessValid = await businessForm.trigger(undefined, { shouldFocus: true })
        const isAddressValid = await addressForm.trigger(undefined, { shouldFocus: true })
        if (!isBusinessValid || !isAddressValid) return

        const values = businessForm.getValues()

        const dto: UpdateBusinessProfileDto = {
            name: values.businessName?.trim() || undefined,
            phone: normalizeDigits(values.phone || ''),
            description: values.description?.trim() || undefined,
            serviceOnSite: values.serviceOnSite,
            serviceInStudio: values.serviceInStudio,
            price: parsePriceToInt(values.price),
            businessHours: mapBusinessHours(values.businessHours ?? []),
        }

        try {
            await updateMyBusinessProfile(dto).unwrap()
            if (business?.id) {
                dispatch(
                    publicBusinessApi.util.invalidateTags([
                        { type: 'PublicBusiness', id: business.id },
                        { type: 'PublicBusiness', id: `${business.id}-hours` },
                    ])
                )
            }
            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))
            Alert.alert('Success', 'Profile updated')
        } catch (err) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ??
                (err as { error?: { data?: { message?: string } } })?.error?.data?.message ??
                (err as { message?: string })?.message ??
                'Failed to update profile'
            setSubmitError(message)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
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
                    <Pressable onPress={handlePickLogo} disabled={isSaving} className="relative">
                        <Avatar
                            uri={currentLogoUri}
                            size={120}
                            borderWidth={4}
                            borderColor="#F6F7FB"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#E5E7EB]">
                                    <AppText className="text-[40px] font-poppins-bold text-[#0C2A63]">{businessInitial}</AppText>
                                </View>
                            }
                        />
                        <View className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                            <Feather name="camera" size={18} color="#0C2A63" />
                        </View>
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
                            editable={!isSaving}
                        />

                        <FormPhoneInput<BusinessInfoFormValues> control={businessForm.control} name="phone" label="Mobile Number" required />

                        {/*<Controller*/}
                        {/*    control={businessForm.control}*/}
                        {/*    name="categoryId"*/}
                        {/*    render={({ field: { value, onChange }, fieldState: { error } }) => (*/}
                        {/*        <View>*/}
                        {/*            <AppText className="mb-2 leading-[21px]">*/}
                        {/*                Category<AppText className="text-danger">*</AppText>*/}
                        {/*            </AppText>*/}
                        {/*            /!**/}
                        {/*             * Use fetched categories when available; fall back to mock options so the existing default value remains selectable.*/}
                        {/*             *!/*/}
                        {/*            {(() => {*/}
                        {/*                const categoryData = categories ?? categoryOptions*/}
                        {/*                const hasOptions = categoryData.length > 0*/}
                        {/*                const placeholder = isCategoriesLoading*/}
                        {/*                    ? 'Loading categories...'*/}
                        {/*                    : hasOptions*/}
                        {/*                      ? 'Select category'*/}
                        {/*                      : 'No categories available'*/}

                        {/*                return (*/}
                        {/*                    <Dropdown*/}
                        {/*                        data={categoryData}*/}
                        {/*                        labelField="title"*/}
                        {/*                        valueField="id"*/}
                        {/*                        value={value}*/}
                        {/*                        placeholder={placeholder}*/}
                        {/*                        disable={isCategoriesLoading || !hasOptions}*/}
                        {/*                        onChange={(item: CategoryType) => onChange(item.id)}*/}
                        {/*                        style={{*/}
                        {/*                            height: 48,*/}
                        {/*                            borderRadius: 12,*/}
                        {/*                            borderWidth: 1,*/}
                        {/*                            borderColor: error ? '#EF4444' : '#CBCBCB',*/}
                        {/*                            paddingHorizontal: 12,*/}
                        {/*                            backgroundColor: '#ffffff',*/}
                        {/*                        }}*/}
                        {/*                        placeholderStyle={{*/}
                        {/*                            fontSize: 14,*/}
                        {/*                            color: '#9CA3AF',*/}
                        {/*                        }}*/}
                        {/*                        selectedTextStyle={{*/}
                        {/*                            fontSize: 14,*/}
                        {/*                            color: '#171717',*/}
                        {/*                        }}*/}
                        {/*                        itemTextStyle={{*/}
                        {/*                            fontSize: 14,*/}
                        {/*                            color: '#171717',*/}
                        {/*                        }}*/}
                        {/*                        containerStyle={{*/}
                        {/*                            borderRadius: 12,*/}
                        {/*                            backgroundColor: '#ffffff',*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                )*/}
                        {/*            })()}*/}
                        {/*            {!!error && <AppText className="mt-1 text-xs font-poppins-semibold text-danger">{error.message}</AppText>}*/}
                        {/*            {!!categoriesError && isCategoriesError ? (*/}
                        {/*                <AppText className="mt-1 text-xs font-poppins-semibold text-danger">*/}
                        {/*                    {(categoriesError as { data?: { message?: string } })?.data?.message ??*/}
                        {/*                        (categoriesError as { message?: string })?.message ??*/}
                        {/*                        'Failed to load categories'}*/}
                        {/*                </AppText>*/}
                        {/*            ) : null}*/}
                        {/*        </View>*/}
                        {/*    )}*/}
                        {/*/>*/}

                        <FormInput<BusinessInfoFormValues>
                            control={businessForm.control}
                            name="price"
                            label="Price"
                            required
                            placeholder="$25/hour"
                            keyboardType="numeric"
                            editable={!isSaving}
                        />

                        <View className="mt-2">
                            <BusinessHoursForm />
                        </View>

                        <View className="mt-1">
                            <AppText className="mb-2 font-poppins-medium text-[14px] text-[#171717]">Service Type</AppText>
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => setValue('serviceOnSite', !serviceOnSite)}
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
                                    onPress={() => setValue('serviceInStudio', !serviceInStudio)}
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
                            numberOfLines={5}
                            inputClassName="text-[14px]"
                            editable={!isSaving}
                        />
                    </FormProvider>
                </View>

                {!!submitError && <AppText className="mt-3 text-center text-danger">{submitError}</AppText>}

                <AppButton title="Save" onPress={handleSave} className="mt-8 bg-[#0C2A63]" textClassName="text-white" disabled={isSaving} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default EditBusinessProfileScreen
