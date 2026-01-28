import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Switch, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { router } from 'expo-router'
import { getAuth } from 'firebase/auth'

import { Avatar } from '@/components/ui/Avatar'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { logoutThunk } from '@/store/features/auth/auth.thunks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileUser } from '@/store/features/profile/profile.selectors'

const getFirstLetter = (name?: string | null, email?: string | null) => {
    const source = (name?.trim() ? name : email?.trim()) ?? ''
    return source ? source[0].toUpperCase() : '?'
}

type MenuRowProps = {
    icon: React.ComponentProps<typeof Feather>['name']
    title: string
    subtitle?: string
    onPress: () => void
    iconColor?: string
}

const MenuRow = ({ icon, title, subtitle, onPress, iconColor }: MenuRowProps) => {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View className="min-h-[74px] flex-row items-center justify-between py-4">
                <View className="flex-1 flex-row items-center gap-3.5">
                    <View className="h-11 w-11 items-center justify-center rounded-[12px]">
                        <Feather name={icon} size={22} color={iconColor ?? '#0C2A63'} />
                    </View>
                    <View className="flex-1 flex-col items-start gap-1">
                        <AppText className="font-poppins-medium text-[13px] leading-[20px] text-[#171717]">{title}</AppText>
                        {subtitle ? <AppText className="font-poppins-medium text-[13px] leading-[20px] text-[#CBCBCB]">{subtitle}</AppText> : null}
                    </View>
                </View>
                <Feather name="chevron-right" size={22} color="#0C2A63" />
            </View>
        </Pressable>
    )
}

const ProfileScreen = () => {
    const dispatch = useAppDispatch()
    const auth = getAuth()
    const user = auth.currentUser
    const [notifications, setNotifications] = useState(true)

    const profileUser = useAppSelector(selectProfileUser)

    const fullName = useMemo(() => {
        return profileUser?.username?.trim() || user?.displayName?.trim() || '—'
    }, [profileUser?.username, user?.displayName])

    const email = profileUser?.email || user?.email || '—'
    const photoURL = profileUser?.avatar || user?.photoURL || undefined
    const fallbackLetter = getFirstLetter(profileUser?.username, email)

    const onLogout = async () => {
        await dispatch(logoutThunk()).unwrap()
    }

    return (
        <View className="flex-1 bg-white pt-[190px]">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-center text-[20px] font-poppins-semibold text-[#0C2A63]">My Profile</AppText>

                <View className="mt-6 items-center">
                    <Avatar
                        uri={photoURL}
                        size={110}
                        borderWidth={4}
                        borderColor="#F6F7FB"
                        fallback={
                            <View className="flex-1 items-center justify-center bg-[#0C2A63]">
                                <AppText className="text-[40px] font-poppins-bold text-white">{fallbackLetter}</AppText>
                            </View>
                        }
                    />

                    <View className="mt-4 w-[170px] items-center gap-1">
                        <AppText className="text-center font-poppins-medium text-[14px] leading-[21px] text-[#0C2A63]">{fullName}</AppText>
                        <AppText className="text-center font-poppins-medium text-[13px] leading-[20px] text-[#CBCBCB]">{email}</AppText>
                    </View>

                    <AppButton
                        title="Edit Profile"
                        onPress={() => router.push('/(protected)/edit-profile')}
                        className="mt-5 bg-[#0C2A63]"
                        textClassName="text-white"
                    />
                </View>

                <View className="mt-8">
                    <View className="rounded-2xl">
                        <MenuRow
                            icon="bookmark"
                            title="Saved Businesses"
                            subtitle="View your saved businesses"
                            iconColor="#0C2A63"
                            onPress={() => router.push('/(protected)/saved-businesses')}
                        />
                        <View className="h-px bg-gray-200" />
                        <MenuRow
                            icon="map-pin"
                            title="Location"
                            subtitle="Saskatoon, Canada"
                            onPress={() => router.push('/(protected)/(onboarding)/location')}
                        />
                    </View>

                    <View className="mt-5 rounded-2xl">
                        <View className="min-h-[74px] flex-row items-center justify-between py-4">
                            <View className="flex-1 flex-row items-center gap-3.5">
                                <View className="h-11 w-11 items-center justify-center rounded-[12px]">
                                    <Feather name="bell" size={22} color="#0C2A63" />
                                </View>
                                <AppText className="font-poppins-medium text-[13px] leading-[20px] text-[#171717]">Notifications</AppText>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#CBCBCB', true: '#0C2A63' }}
                                thumbColor="#F6F7FB"
                            />
                        </View>

                        <View className="h-px bg-gray-200" />

                        <Pressable onPress={onLogout} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                            <View className="min-h-[74px] flex-row items-center justify-between py-4">
                                <View className="flex-1 flex-row items-center gap-3.5">
                                    <View className="h-11 w-11 items-center justify-center rounded-[12px]">
                                        <Feather name="log-out" size={22} color="#FF4D4D" />
                                    </View>
                                    <AppText className="font-poppins-medium text-[13px] leading-[20px] text-[#FF4D4D]">Log out</AppText>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default ProfileScreen
