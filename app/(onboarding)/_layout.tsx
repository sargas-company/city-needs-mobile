import { Stack } from 'expo-router'

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="pre-onboarding" />
            <Stack.Screen name="welcome" />
        </Stack>
    )
}
