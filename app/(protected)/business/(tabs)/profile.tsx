import React from 'react'
import { View, Text } from 'react-native'

const BusinessProfileScreen = () => {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-lg font-semibold text-[#0C2A63]">Business Profile</Text>
            <Text className="text-sm text-gray-500">Profile details for business owners will appear here.</Text>
        </View>
    )
}

export default BusinessProfileScreen
