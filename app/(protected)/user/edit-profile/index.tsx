import React, { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Feather from '@expo/vector-icons/Feather'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { getAuth } from 'firebase/auth'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'
import { FormInput } from '@/components/ui/FormInput'
import { FormPhoneInput } from '@/components/ui/FormPhoneInput'
import { resolveApiData } from '@/store/features/auth/auth.thunks'
import { authApi } from '@/store/features/auth/authApi'
import { setProfileUser } from '@/store/features/profile/profile.slice'
import { selectProfileUser } from '@/store/features/profile/profile.selectors'
import type { AppUser } from '@/store/features/profile/profile.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { type UpdateMeRequest, useUpdateMeMutation, useUpdateMyAvatarMutation } from '@/store/features/profile/profileApi'

type EditProfileForm = z.infer<typeof editProfileSchema>

const editProfileSchema = z.object({
    username: z
        .string()
        .min(1, 'Name is required')
        .max(64, 'Max 64 characters')
        .transform((v) => v.trim()),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email')
        .transform((v) => v.trim()),
    phone: z
        .string()
        .max(32, 'Max 32 characters')
        .transform((v) => v.trim()),
    password: z
        .string()
        .max(128, 'Password is too long')
        .refine((v) => v === '' || v.length >= 6, { message: 'Password must be at least 6 characters' }),
})

const normalizeDigits = (val: string) => val.replace(/\D/g, '')

type PickedImage = {
    uri: string
    name: string
    type: string
}

const EditProfileScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const profileUser = useAppSelector(selectProfileUser)
    const authUser = getAuth().currentUser

    const initialValues = useMemo(
        () => ({
            username: profileUser?.username ?? authUser?.displayName ?? '',
            email: profileUser?.email ?? authUser?.email ?? '',
            phone: profileUser?.phone ?? '',
        }),
        [authUser?.displayName, authUser?.email, profileUser?.username, profileUser?.email, profileUser?.phone]
    )

    const [selectedAvatar, setSelectedAvatar] = useState<PickedImage | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const [updateMe, { isLoading: isUpdateMeLoading }] = useUpdateMeMutation()
    const [updateMyAvatar, { isLoading: isUpdateAvatarLoading }] = useUpdateMyAvatarMutation()

    const form = useForm<EditProfileForm>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            username: initialValues.username,
            email: initialValues.email,
            phone: initialValues.phone,
            password: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = form

    const isSaving = isSubmitting || isUpdateAvatarLoading || isUpdateMeLoading

    const currentAvatarUri = selectedAvatar?.uri || profileUser?.avatar || undefined

    const handlePickAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsMultipleSelection: false,
            })
            if (result.canceled || !result.assets?.length) return
            const asset = result.assets[0]
            setSelectedAvatar({
                uri: asset.uri,
                name: asset.fileName ?? 'avatar.jpg',
                type: asset.mimeType ?? 'image/jpeg',
            })
        } catch (err) {
            setSubmitError('Failed to pick image')
        }
    }

    const onSubmit = async (values: EditProfileForm) => {
        setSubmitError(null)
        try {
            if (selectedAvatar) {
                await updateMyAvatar(selectedAvatar).unwrap()
            }

            const payload: UpdateMeRequest = {}

            const username = values.username.trim()
            if (username && username !== initialValues.username) {
                payload.username = username
            }

            const email = values.email.trim()
            if (email && email !== initialValues.email) {
                payload.email = email
            }

            const phone = values.phone.trim()
            if (phone && phone !== initialValues.phone) {
                payload.phone = normalizeDigits(phone)
            }

            const password = values.password?.trim()
            if (password) {
                payload.password = password
            }

            if (Object.keys(payload).length > 0) {
                await updateMe(payload).unwrap()
            }

            const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            const resolvedMe = resolveApiData<AppUser>(meResult)
            dispatch(setProfileUser(resolvedMe))

            router.back()
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
        <View className="flex-1 pt-[190px]">
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mb-6 h-12 flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-12 w-12 items-center justify-center rounded-full bg-white"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                        <Feather name="arrow-left" size={22} color="#0C2A63" />
                    </Pressable>
                    <AppText className="flex-1 text-center text-[20px] font-poppins-semibold text-[#0C2A63]">Edit Profile</AppText>
                    <View className="h-12 w-12" />
                </View>

                <View className="items-center">
                    <Pressable onPress={handlePickAvatar} disabled={isSaving} className="relative">
                        <Avatar
                            uri={currentAvatarUri}
                            size={120}
                            borderWidth={4}
                            borderColor="#F6F7FB"
                            fallback={
                                <View className="flex-1 items-center justify-center bg-[#0C2A63]">
                                    <AppText className="text-[40px] font-poppins-bold text-white">?</AppText>
                                </View>
                            }
                        />
                        <View className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                            <Feather name="camera" size={18} color="#0C2A63" />
                        </View>
                    </Pressable>
                </View>

                <View className="mt-8 flex gap-4">
                    <FormInput<EditProfileForm> control={control} name="username" label="Name" placeholder="Your name" editable={!isSaving} />

                    <FormInput<EditProfileForm>
                        control={control}
                        name="email"
                        label="Email Address"
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isSaving}
                    />

                    <FormPhoneInput<EditProfileForm> control={control} name="phone" label="Mobile Number" required={false} />

                    <FormInput<EditProfileForm>
                        control={control}
                        name="password"
                        label="Password"
                        placeholder="Enter new password"
                        secureTextEntry
                        editable={!isSaving}
                    />
                </View>

                {!!submitError && <AppText className="mt-3 text-center text-sm text-[#FF4D4D]">{submitError}</AppText>}

                <View className="mt-8">
                    <AppButton
                        title="Save"
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSaving}
                        className="h-14 rounded-full bg-[#0C2A63]"
                        textClassName="text-white"
                    />
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

export default EditProfileScreen
