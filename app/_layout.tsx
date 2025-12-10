import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { useEffect } from 'react'
import '../global.css'
import '@dev-plugins/async-storage'
import { PersistGate } from 'redux-persist/integration/react'

import '@/services/auth'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { bootstrapAuth } from '@/services/auth/auth.bootstrap'
import { store, persistor, useAppDispatch } from '@/store'

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initAsyncStorageDebug } = require('@/src/utils/asyncStorageDebug')
    initAsyncStorageDebug()
}

const RootNavigation = () => {
    const colorScheme = useColorScheme()
    const dispatch = useAppDispatch()

    useEffect(() => {
        void bootstrapAuth(dispatch)
    }, [dispatch])

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
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <RootNavigation />
            </PersistGate>
        </Provider>
    )
}
