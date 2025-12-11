import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { selectIsEmailVerified, selectOnboardingStep } from '@/store/features/profile/profile.selectors'

const Gate = () => {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)
    const emailVerified = useAppSelector(selectIsEmailVerified)
    const onboardingStep = useAppSelector(selectOnboardingStep)

    useEffect(() => {
        if (status === 'loading' || status === 'idle') {
            return
        }

        if (!isAuth) {
            router.replace('/(auth)/sign-in')
            return
        }

        if (!emailVerified) {
            router.replace('/(protected)/verify-email')
            return
        }

        // const step = onboardingStep ?? 0
        const step = 1

        if (step && step > 0) {
            switch (step) {
                case 1:
                    router.replace('/(protected)/(onboarding)/step-1')
                    break
                case 2:
                    router.replace('/(protected)/(onboarding)/step-2')
                    break
                case 3:
                    router.replace('/(protected)/(onboarding)/step-3')
                    break
                default:
                    router.replace('/(protected)/(tabs)')
            }
            return
        }

        router.replace('/(protected)/(tabs)')
    }, [emailVerified, isAuth, onboardingStep, router, status])

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Loading...</Text>
        </View>
    )
}

export default Gate
