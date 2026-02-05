import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { WAVE_HEIGHT } from '@/constants/layout'

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
                    },
                }}
            >
                <Stack.Screen name="reset-password" options={{ contentStyle: { paddingTop: 0 } }} />
                <Stack.Screen name="reset-password-success" options={{ contentStyle: { paddingTop: 0 } }} />
            </Stack>
        </View>
    )
}
