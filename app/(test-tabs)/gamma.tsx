import { View, Text, StyleSheet } from 'react-native'

import { WaveHeader } from '@/components/layout/WaveHeader'

export default function SearchScreen() {
    return (
        <View style={styles.container}>
            <WaveHeader />
            <View style={styles.content}>
                <Text style={styles.title}>Search</Text>
                <Text style={styles.subtitle}>Tab with WaveHeader</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#0C2A63',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
})
