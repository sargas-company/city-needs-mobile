import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const SignIn = () => {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <View className="items-center gap-4">
                <Text className="text-2xl font-bold text-black">Sign In</Text>
                <Text className="text-base text-gray-600">TODO: connect auth form</Text>
                <Link href="/(auth)/sign-up" className="text-blue-500">
                    Go to Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
