import { Stack } from 'expo-router'
import { View } from 'react-native'

const DEFAULT_CONTENT_TOP = 140
const ProtectedOnboardingLayout = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#FFFFFF',
                        paddingTop: DEFAULT_CONTENT_TOP,
                    },
                }}
            >
                <Stack.Screen name="role" options={{ contentStyle: { paddingTop: 120 } }} />
                <Stack.Screen name="location" options={{ contentStyle: { paddingTop: 0 } }} />
                <Stack.Screen name="location-manual" options={{ contentStyle: { paddingTop: 120 } }} />
                <Stack.Screen name="customer/address" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="customer/services" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="provider/business-info" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="provider/address" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="provider/branding" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="provider/verify" options={{ contentStyle: { paddingTop: 130 } }} />
                <Stack.Screen name="verify-email" options={{ contentStyle: { paddingTop: 130 } }} />
            </Stack>
        </View>
    )
}

export default ProtectedOnboardingLayout
