import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins'
import { PersistGate } from 'redux-persist/integration/react'
import { Stack } from 'expo-router'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'

import '../global.css'
import '@/services/auth'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { bootstrapAuthThunk, logoutThunk } from '@/store/features/auth/auth.thunks'
import { setOnSessionExpired } from '@/services/auth/authEvents'
import { persistor, store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { MapProvider } from '@/src/features/map'

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initAsyncStorageDebug } = require('@/src/utils/asyncStorageDebug')
    initAsyncStorageDebug()
}

// AppContent: Contains KeyboardProvider INSIDE Redux context (critical for touch handling)
function AppContent() {
    const colorScheme = useColorScheme()
    const dispatch = useAppDispatch()
    const bootstrapRef = useRef(false)

    useEffect(() => {
        if (bootstrapRef.current) return
        bootstrapRef.current = true

        setOnSessionExpired(() => {
            void dispatch(logoutThunk())
        })

        void dispatch(bootstrapAuthThunk())
    }, [dispatch])

    return (
        <KeyboardProvider>
            <MapProvider engine="google">
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(protected)" />
                        <Stack.Screen name="+not-found" />
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
