import { Stack } from 'expo-router'
import { View } from 'react-native'

const BookingFlowLayout = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    animation: 'slide_from_right',
                }}
            />
        </View>
    )
}

export default BookingFlowLayout
