import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSubmitOnboardingMutation } from '@/store/features/onboarding/onboardingApi'

const ProviderBusinessInfo = () => {
    const router = useRouter()
    const [submitOnboarding, { isLoading }] = useSubmitOnboardingMutation()

    const handleSubmit = async () => {
        try {
            await submitOnboarding({ action: 'BUSINESS_PROFILE', payload: {} }).unwrap()
            router.replace('/(protected)/gate')
        } catch {
            // noop
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="flex-1 items-center justify-center gap-4">
                <Text className="text-2xl font-bold text-black">Business profile</Text>
                <Text className="text-base text-gray-700">Tell us about your business.</Text>
                <Pressable
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`w-full max-w-md items-center rounded-lg border border-blue-600 px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                >
                    <Text className="text-base font-semibold text-blue-600">Continue</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default ProviderBusinessInfo
