import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { selectIsEmailVerified, selectOnboardingStep, selectProfileUser, selectUserRole } from '@/store/features/profile/profile.selectors'

const Gate = () => {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)
    const emailVerified = useAppSelector(selectIsEmailVerified)
    const onboardingStep = useAppSelector(selectOnboardingStep)
    const role = useAppSelector(selectUserRole)
    const profileUser = useAppSelector(selectProfileUser)

    useEffect(() => {
        if (status === 'loading' || status === 'idle') {
            return
        }

        if (!isAuth) {
            router.replace('/(auth)/sign-in')
            return
        }

        if (!emailVerified) {
            router.replace('/(protected)/(onboarding)/verify-email')
            return
        }

        if (!role) {
            router.replace('/(protected)/(onboarding)/role')
            return
        }

        if (profileUser?.onboardingStep === null || profileUser?.onboardingStep === undefined) {
            router.replace('/(protected)/(tabs)')
            return
        }

        const step = onboardingStep ?? 0

        if (role === 'END_USER') {
            if (step === 1) {
                router.replace('/(protected)/(onboarding)/customer/address')
                return
            }
            if (step === 2) {
                router.replace('/(protected)/(onboarding)/customer/services')
                return
            }
        }

        if (role === 'BUSINESS_OWNER') {
            if (step === 1) {
                router.replace('/(protected)/(onboarding)/provider/business-info')
                return
            }
            if (step === 2) {
                router.replace('/(protected)/(onboarding)/provider/address')
                return
            }
            if (step === 3) {
                router.replace('/(protected)/(onboarding)/provider/branding')
                return
            }
            if (step === 4) {
                router.replace('/(protected)/(onboarding)/provider/verify')
                return
            }
        }

        router.replace('/(protected)/(tabs)')
    }, [emailVerified, isAuth, onboardingStep, profileUser?.onboardingStep, role, router, status])

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Loading...</Text>
        </View>
    )
}

export default Gate
