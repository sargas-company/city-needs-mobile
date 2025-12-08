import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const SignUp = () => {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <View className="items-center gap-4">
                <Text className="text-2xl font-bold text-black">Sign Up</Text>
                <Text className="text-base text-gray-600">TODO: connect registration form</Text>
                <Link href="/(auth)/sign-in" className="text-blue-500">
                    Go to Sign In
                </Link>
            </View>
        </View>
    )
}

export default SignUp
