import { Image } from 'expo-image'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useCallback } from 'react'

import { HelloWave } from '@/components/hello-wave'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { logoutThunk } from '@/store/features/auth/auth.thunks'
import { useAppDispatch } from '@/store/hooks'

export default function HomeScreen() {
    const dispatch = useAppDispatch()

    const handleLogout = useCallback(async () => {
        await dispatch(logoutThunk()).unwrap()
    }, [dispatch])

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome!</ThemedText>
                <HelloWave />
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 1: Try it</ThemedText>
                <ThemedText>
                    Edit <ThemedText type="defaultSemiBold">app/(protected)/(tabs)/index.tsx</ThemedText> to see changes. Press{' '}
                    <ThemedText type="defaultSemiBold">
                        {Platform.select({
                            ios: 'cmd + d',
                            android: 'cmd + m',
                            web: 'F12',
                        })}
                    </ThemedText>{' '}
                    to open developer tools.
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <Link href="/modal">
                    <Link.Trigger>
                        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
                    </Link.Trigger>
                    <Link.Preview />
                    <Link.Menu>
                        <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
                        <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => alert('Share pressed')} />
                        <Link.Menu title="More" icon="ellipsis">
                            <Link.MenuAction title="Delete" icon="trash" destructive onPress={() => alert('Delete pressed')} />
                        </Link.Menu>
                    </Link.Menu>
                </Link>

                <ThemedText>{`Tap the Explore tab to learn more about what's included in this starter app.`}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
                <ThemedText>
                    {`When you're ready, run `}
                    <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
                    <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
                    <ThemedText type="defaultSemiBold">app</ThemedText> to <ThemedText type="defaultSemiBold">app-example</ThemedText>.
                </ThemedText>
                <View style={styles.welcomeButtonContainer}>
                    <TouchableOpacity onPress={() => router.push('/welcome')} style={styles.welcomeButton} accessibilityRole="button">
                        <Text style={styles.welcomeButtonText}>Open Welcome</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={[styles.welcomeButton, styles.logoutButton]} accessibilityRole="button">
                        <Text style={styles.welcomeButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </ParallaxScrollView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    welcomeButtonContainer: {
        marginTop: 8,
        flexDirection: 'row',
        gap: 12,
    },
    welcomeButton: {
        backgroundColor: '#0286FF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
    },
    welcomeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
})
