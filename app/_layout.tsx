import { useEffect } from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins'
import { Stack } from 'expo-router'
import 'react-native-reanimated'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import '../global.css'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { MapProvider } from '@/src/features/map/context/MapProvider'
import { store, persistor } from '@/store/store'
import { useAppDispatch } from '@/store/hooks'
import { bootstrapAuthThunk } from '@/store/features/auth/auth.thunks'

// ══════════════════════════════════════════════════════════════════════════════
// iOS 26 TAB DEBUGGING - Step by step adding components
// ✅ Added: KeyboardProvider, MapProvider, Redux, Firebase Auth Bootstrap
// ══════════════════════════════════════════════════════════════════════════════

function AppContent() {
    const colorScheme = useColorScheme()
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(bootstrapAuthThunk())
    }, [dispatch])

    return (
        <KeyboardProvider>
            <MapProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(protected)" />
                        <Stack.Screen name="(test-tabs)" />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </MapProvider>
        </KeyboardProvider>
    )
}

export default function RootLayout() {
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
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <AppContent />
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    )
}
