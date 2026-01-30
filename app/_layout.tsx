import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import '@dev-plugins/async-storage'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins'
import { PersistGate } from 'redux-persist/integration/react'
import { Stack } from 'expo-router'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import 'react-native-reanimated'

import '../global.css'
import '@/services/auth'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { bootstrapAuthThunk } from '@/store/features/auth/auth.thunks'
import { persistor, store } from '@/store'
import { useAppDispatch } from '@/store/hooks'

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initAsyncStorageDebug } = require('@/src/utils/asyncStorageDebug')
    initAsyncStorageDebug()
}

const RootNavigation = () => {
    const colorScheme = useColorScheme()
    const dispatch = useAppDispatch()
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
        Poppins_700Bold,
    })

    useEffect(() => {
        void dispatch(bootstrapAuthThunk())
    }, [dispatch])

    if (!fontsLoaded) {
        return null
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(protected)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    )
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <RootNavigation />
                    </PersistGate>
                </Provider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    )
}
