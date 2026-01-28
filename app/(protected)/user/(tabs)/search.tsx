import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function SearchScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Search</Text>
            <Text style={styles.subtitle}>Description</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '700' },
    subtitle: { marginTop: 8, fontSize: 14, color: '#666' },
})
