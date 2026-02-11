import { Stack, useRouter, usePathname } from 'expo-router'
import { useEffect } from 'react'
import { View, Text } from 'react-native'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { BusinessVerificationGuard } from '@/components/guards/BusinessVerificationGuard'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { WAVE_HEIGHT } from '@/constants/layout'

export default function ProtectedLayout() {
    const router = useRouter()
    const pathname = usePathname()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)
    const isMapScreen = pathname === '/user/map'

    useEffect(() => {
        // Only redirect when we're certain the user is unauthenticated.
        // During bootstrap ('idle' or 'loading'), we wait for Firebase to restore the session.
        if (status === 'unauthenticated') {
            router.replace('/(auth)/sign-in')
        }
    }, [router, status])

    // Show loading while auth state is being determined (idle = pre-bootstrap, loading = during bootstrap)
    if (status === 'idle' || status === 'loading') {
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
            {!isMapScreen && <WaveHeader height={WAVE_HEIGHT} showLogo />}

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
                <Stack.Screen
                    name="user/reel/[id]"
                    options={{
                        presentation: 'fullScreenModal',
                        animation: 'fade',
                        contentStyle: { backgroundColor: '#000000' },
                    }}
                />
            </Stack>
        </BusinessVerificationGuard>
    )
}
