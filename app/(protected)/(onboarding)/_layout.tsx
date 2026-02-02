import { Stack } from 'expo-router'
import { View } from 'react-native'

const ProtectedOnboardingLayout = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                }}
            />
        </View>
    )
}

export default ProtectedOnboardingLayout
