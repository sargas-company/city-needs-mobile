import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function ProtectedLayout() {
    const router = useRouter()
    const useAuth = () => {
        return { isLoaded: false, isSignedIn: true }
    }
    const { isSignedIn, isLoaded } = useAuth()

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.replace('/(auth)/sign-in')
        }
    }, [isLoaded, isSignedIn])

    if (!isLoaded) return null

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
        </Stack>
    )
}
