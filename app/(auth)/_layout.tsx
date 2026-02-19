import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { WAVE_HEIGHT } from '@/constants/layout'
import LogoSvg from '@/assets/images/main_logo.svg'
import { AppText } from '@/components/ui/AppText'

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

    // Show loading during bootstrap (idle → loading → authenticated/unauthenticated)
    if (status === 'idle' || status === 'loading') {
        return (
            <View className="flex-1 items-center justify-center gap-5 bg-brand">
                <LogoSvg width={140} height={140} />
                <AppText className={'font-poppins-semibold text-white text-[25px]'}>City Needs</AppText>
            </View>
        )
    }

    // Already authenticated - don't render auth screens
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
