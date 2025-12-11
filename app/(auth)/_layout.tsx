import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { View, Text } from 'react-native'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'

export default function AuthLayout() {
    const router = useRouter()
    const segments = useSegments()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)
    const isVerifyEmailRoute = segments?.[1] === 'verify-email'
    const isSignUpRoute = segments?.[1] === 'sign-up'

    useEffect(() => {
        if (status === 'authenticated' && isAuth && !isVerifyEmailRoute && !isSignUpRoute) {
            router.replace('/(protected)/(tabs)')
        }
    }, [isAuth, isSignUpRoute, isVerifyEmailRoute, router, status])

    if (status === 'loading' || status === 'idle') {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading...</Text>
            </View>
        )
    }

    if (isAuth && !isVerifyEmailRoute) {
        return null
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="verify-email" />
        </Stack>
    )
}
