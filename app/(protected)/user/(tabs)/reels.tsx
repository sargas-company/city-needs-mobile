import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const TEST_BUSINESS_ID = '9b4023d0-fc0e-4c95-a9f4-5b79041ce8a3'

export default function ReelsScreen() {
    const router = useRouter()

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Reels</Text>
            <Text style={styles.subtitle}>Description</Text>

            <TouchableOpacity style={styles.testButton} onPress={() => router.push(`/(protected)/user/book/${TEST_BUSINESS_ID}`)}>
                <Text style={styles.testButtonText}>Test: Open Business</Text>
            </TouchableOpacity>

            {/*<TouchableOpacity style={styles.testButton}>*/}
            {/*    <Text*/}
            {/*        style={styles.testButtonText}*/}
            {/*        onPress={() => {*/}
            {/*            router.replace(`/(protected)/user/book/${TEST_BUSINESS_ID}/leave-review`)*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Suc*/}
            {/*    </Text>*/}
            {/*</TouchableOpacity>*/}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '700' },
    subtitle: { marginTop: 8, fontSize: 14, color: '#666' },
    testButton: { marginTop: 24, backgroundColor: '#0286FF', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
    testButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
