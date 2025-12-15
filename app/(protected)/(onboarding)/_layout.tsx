import { Stack } from 'expo-router'

const ProtectedOnboardingLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="role" />
            <Stack.Screen name="customer/address" />
            <Stack.Screen name="customer/services" />
            <Stack.Screen name="provider/business-info" />
            <Stack.Screen name="provider/address" />
            <Stack.Screen name="provider/branding" />
        </Stack>
    )
}

export default ProtectedOnboardingLayout
