import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins'
import { Stack } from 'expo-router'
import 'react-native-reanimated'

import '../global.css'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { useColorScheme } from '@/hooks/use-color-scheme'

// ══════════════════════════════════════════════════════════════════════════════
// MINIMAL TEST BUILD - iOS 26 TAB DEBUGGING
// Removed: Firebase, Redux, Auth, Onboarding, KeyboardProvider, MapProvider
// ══════════════════════════════════════════════════════════════════════════════

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
        Poppins_700Bold,
    })

    if (!fontsLoaded) {
        return null
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(test-tabs)" />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </GestureHandlerRootView>
    )
}
