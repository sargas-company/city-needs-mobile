import { Stack, useRouter } from 'expo-router'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'

export default function ProtectedLayout() {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    // useEffect(() => {
    //     if (status === 'unauthenticated') {
    //         router.replace('/(auth)/sign-in')
    //     }
    // }, [router, status])
    //
    // if (status === 'loading') {
    //     return (
    //         <View className="flex-1 items-center justify-center bg-white">
    //             <Text>Loading session...</Text>
    //         </View>
    //     )
    // }
    //
    // if (!isAuth) {
    //     return null
    // }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="gate" />
            <Stack.Screen name="verify-email" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    )
}
