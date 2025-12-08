import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

import { useAppSelector } from '@/store'
import { selectAuthStatus, selectIsAuth } from '@/store/auth/auth.slice'

export default function AuthLayout() {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    useEffect(() => {
        if (status === 'authenticated' && isAuth) {
            router.replace('/(protected)/home')
        }
    }, [isAuth, router, status])

    if (status === 'loading' || status === 'idle') {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading...</Text>
            </View>
        )
    }

    if (isAuth) {
        return null
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
        </Stack>
    )
}
