import { useCallback, useEffect } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { selectIsEmailVerified, selectOnboardingStep, selectProfileUser, selectUserRole } from '@/store/features/profile/profile.selectors'
import { UserRole } from '@/store/features/profile/profile.types'

const Gate = () => {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)
    const emailVerified = useAppSelector(selectIsEmailVerified)
    const onboardingStep = useAppSelector(selectOnboardingStep)
    const role = useAppSelector(selectUserRole)
    const profileUser = useAppSelector(selectProfileUser)

    const redirectToRoleTabs = useCallback(() => {
        if (role === UserRole.END_USER) {
            // TODO: revert to '/(protected)/user/(tabs)' after testing
            router.replace('/(protected)/user/(tabs)/test-gamma')
            return
        }

        if (role === UserRole.BUSINESS_OWNER) {
            router.replace('/(protected)/business/(tabs)')
            return
        }
    }, [role, router])

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
            redirectToRoleTabs()
            return
        }

        const step = onboardingStep ?? 0

        if (role === UserRole.END_USER) {
            if (step === 1) {
                router.replace('/(protected)/(onboarding)/customer/address')
                return
            }
            if (step === 2) {
                router.replace('/(protected)/(onboarding)/customer/services')
                return
            }
        }

        if (role === UserRole.BUSINESS_OWNER) {
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

        redirectToRoleTabs()
    }, [emailVerified, isAuth, onboardingStep, profileUser?.onboardingStep, redirectToRoleTabs, role, router, status])

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Loading...</Text>
        </View>
    )
}

export default Gate
