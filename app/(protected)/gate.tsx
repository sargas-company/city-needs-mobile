import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'

// ══════════════════════════════════════════════════════════════════════════════
// iOS 26 TAB DEBUGGING - Simplified gate
// Only checks auth status, skips onboarding logic
// isAuth → test-tabs, !isAuth → sign-in
// ══════════════════════════════════════════════════════════════════════════════

const Gate = () => {
    const router = useRouter()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    useEffect(() => {
        // Wait for auth bootstrap to complete
        if (status === 'loading' || status === 'idle') {
            return
        }

        if (isAuth) {
            // Authenticated → go to test tabs
            router.replace('/(test-tabs)')
        } else {
            // Not authenticated → go to sign in
            router.replace('/(auth)/sign-in')
        }
    }, [isAuth, router, status])

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Loading...</Text>
        </View>
    )
}

export default Gate
