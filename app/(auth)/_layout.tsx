import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { WaveHeader } from '@/components/layout/WaveHeader'

const WAVE_HEIGHT = 190
const DEFAULT_CONTENT_TOP = 140

export default function AuthLayout() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    useEffect(() => {
        if (status === 'authenticated' && isAuth) {
            router.replace('/(protected)/gate')
        }
    }, [isAuth, router, status])

    if (status === 'idle') {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading...</Text>
            </View>
        )
    }

    if (isAuth) return null

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <WaveHeader height={WAVE_HEIGHT} topInset={insets.top} showLogo />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#FFFFFF',
                        paddingTop: DEFAULT_CONTENT_TOP,
                    },
                }}
            >
                {/* Пер-экранные правки отступа (если нужно) */}
                <Stack.Screen name="sign-in" options={{ contentStyle: { backgroundColor: '#FFFFFF', paddingTop: 150 } }} />
                <Stack.Screen name="sign-up" options={{ contentStyle: { backgroundColor: '#FFFFFF', paddingTop: 140 } }} />
                <Stack.Screen name="reset-password" options={{ contentStyle: { backgroundColor: '#FFFFFF', paddingTop: 120 } }} />
            </Stack>
        </View>
    )
}
