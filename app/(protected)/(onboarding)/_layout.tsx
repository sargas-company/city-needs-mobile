import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WaveHeader } from '@/components/layout/WaveHeader'

const WAVE_HEIGHT = 190
const DEFAULT_CONTENT_TOP = 140
const ProtectedOnboardingLayout = () => {
    const insets = useSafeAreaInsets()

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <WaveHeader height={WAVE_HEIGHT} topInset={insets.top} showLogo />

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
                <Stack.Screen name="customer/address" options={{ contentStyle: { paddingTop: 150 } }} />
                <Stack.Screen name="customer/services" options={{ contentStyle: { paddingTop: 150 } }} />
                <Stack.Screen name="provider/business-info" options={{ contentStyle: { paddingTop: 150 } }} />
                <Stack.Screen name="provider/address" options={{ contentStyle: { paddingTop: 150 } }} />
                <Stack.Screen name="provider/branding" options={{ contentStyle: { paddingTop: 150 } }} />
                <Stack.Screen name="verify-email" options={{ contentStyle: { paddingTop: 120 } }} />
            </Stack>
        </View>
    )
}

export default ProtectedOnboardingLayout
