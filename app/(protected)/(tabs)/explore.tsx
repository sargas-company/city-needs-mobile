import { StyleSheet } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function ExploreScreen() {
    return (
        <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} headerImage={null}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Explore</ThemedText>
            </ThemedView>
            <ThemedText>Placeholder for explore content.</ThemedText>
        </ParallaxScrollView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
})
