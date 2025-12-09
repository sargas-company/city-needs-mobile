import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { useEffect } from 'react'
import '../global.css'
import '@dev-plugins/async-storage'

import '@/services/auth'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { bootstrapAuth } from '@/services/auth/auth.bootstrap'
import { store, useAppDispatch } from '@/store'

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
                <Stack.Screen name="(protected)" />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    )
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <RootNavigation />
        </Provider>
    )
}
