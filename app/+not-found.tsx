import { Link, Stack } from 'expo-router'
import { SafeAreaView, Text, View } from 'react-native'

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <View className="items-center gap-4">
                    <Text className="text-2xl font-bold text-black">This screen doesn&apos;t exist.</Text>
                    <Link href="/" className="text-blue-500">
                        Go to home screen!
                    </Link>
                </View>
            </SafeAreaView>
        </>
    )
}
