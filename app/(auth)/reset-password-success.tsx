import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import DoneImg from '@/assets/images/done-orange.svg'

const ResetPasswordSuccess = () => {
    const router = useRouter()

    const handleDone = () => {
        router.replace('/(auth)/sign-in')
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center px-6">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full">
                    <DoneImg />
                </View>
                <AppText className="mb-2 text-center text-[22px] font-poppins-semibold text-[#0C2A63]">Check your email</AppText>
                <AppText className="mb-8 text-center text-[14px] leading-5 text-text-muted">
                    We sent a password reset link to your email address. Please check your inbox.
                </AppText>
                <View className="w-full gap-3">
                    <AppButton title="Done" onPress={handleDone} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ResetPasswordSuccess
