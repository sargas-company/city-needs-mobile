import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, Text } from 'react-native'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { BusinessVerificationGuard } from '@/components/guards/BusinessVerificationGuard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { WAVE_HEIGHT } from '@/constants/layout'

export default function ProtectedLayout() {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/(auth)/sign-in')
        }
    }, [router, status])

    if (status === 'loading') {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading session...</Text>
            </View>
        )
    }

    if (!isAuth) {
        return null
    }

    return (
        <BusinessVerificationGuard>
            <WaveHeader height={WAVE_HEIGHT} showLogo />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                }}
            >
                <Stack.Screen name="gate" />
                <Stack.Screen name="(onboarding)" />
            </Stack>
        </BusinessVerificationGuard>
    )
}
