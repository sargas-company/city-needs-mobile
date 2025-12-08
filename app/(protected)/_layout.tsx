import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

import { useAppSelector } from '@/store'
import { selectAuthStatus, selectIsAuth } from '@/store/auth/auth.slice'

export default function ProtectedLayout() {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/(auth)/sign-in')
        }
    }, [router, status])

    if (status === 'loading' || status === 'idle') {
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
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
        </Stack>
    )
}
