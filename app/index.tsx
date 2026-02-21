import { useEffect } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

import { useOnboarding } from '@/hooks/useOnboarding'
import LogoSvg from '@/assets/images/main_logo.svg'
import { AppText } from '@/components/ui/AppText'

// ══════════════════════════════════════════════════════════════════════════════
// iOS 26 TAB DEBUGGING - Full flow with onboarding
// Not completed onboarding → pre-onboarding
// Completed onboarding → gate (auth check)
// ══════════════════════════════════════════════════════════════════════════════

export default function Index() {
    const router = useRouter()
    const { isCompleted, isLoading } = useOnboarding()

    useEffect(() => {
        if (isLoading) return

        if (isCompleted) {
            router.replace('/(protected)/gate')
        } else {
            router.replace('/(onboarding)/pre-onboarding')
        }
    }, [isCompleted, isLoading, router])

    // Show splash while loading
    return (
        <View className="flex-1 items-center justify-center gap-5 bg-brand">
            <LogoSvg width={140} height={140} />
            <AppText className="font-poppins-semibold text-white text-[25px]">City Needs</AppText>
        </View>
    )
}
