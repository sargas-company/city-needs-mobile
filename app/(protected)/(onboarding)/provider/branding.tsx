import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSubmitOnboardingMutation } from '@/store/features/onboarding/onboardingApi'

const ProviderBranding = () => {
    const router = useRouter()
    const [submitOnboarding, { isLoading }] = useSubmitOnboardingMutation()

    const handleSkip = async () => {
        try {
            await submitOnboarding({ action: 'BUSINESS_FILES_SKIP' }).unwrap()
            router.replace('/(protected)/gate')
        } catch {
            // noop
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="flex-1 items-center justify-center gap-4">
                <Text className="text-2xl font-bold text-black">Branding / Files</Text>
                <Text className="text-base text-gray-700">Upload branding or skip for now.</Text>
                <View className="w-full max-w-md gap-3">
                    <Pressable
                        onPress={handleSkip}
                        disabled={isLoading}
                        className={`items-center rounded-lg border border-blue-600 px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-base font-semibold text-blue-600">Skip for now</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ProviderBranding
