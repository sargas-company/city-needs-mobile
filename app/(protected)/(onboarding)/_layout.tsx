import { Stack } from 'expo-router'

const ProtectedOnboardingLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="step-1" />
            <Stack.Screen name="step-2" />
            <Stack.Screen name="step-3" />
        </Stack>
    )
}

export default ProtectedOnboardingLayout
