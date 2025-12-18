import { Link, Stack } from 'expo-router'
import { SafeAreaView, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <View className="items-center gap-4">
                    <AppText className="text-2xl font-bold text-text">This screen doesn&apos;t exist.</AppText>
                    <Link href="/" className="font-poppins-semibold text-brand">
                        Go to home screen!
                    </Link>
                </View>
            </SafeAreaView>
        </>
    )
}
