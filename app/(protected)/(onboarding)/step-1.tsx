import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { authApi } from '@/store/features/auth/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileUser } from '@/store/features/profile/profile.selectors'

const Step1 = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const profileUser = useAppSelector(selectProfileUser)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleNext = async () => {
        setLoading(true)
        setError(null)
        try {
            await dispatch(authApi.endpoints.authSync.initiate({ onboardingStep: 2 }, { forceRefetch: true })).unwrap()
            await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
            router.replace('/(protected)/gate')
        } catch {
            setError('Failed to advance onboarding')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="flex-1 items-center justify-center gap-4">
                <Text className="text-2xl font-bold text-black">Onboarding Step 1</Text>
                <Text className="text-base text-gray-700">{`Hello ${profileUser?.username ?? ''}, complete step 1.`}</Text>
                {error ? <Text className="text-base text-red-600">{error}</Text> : null}
                <Pressable
                    onPress={handleNext}
                    disabled={loading}
                    className={`w-full max-w-md items-center rounded-md px-4 py-3 ${loading ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                    <Text className="text-base font-semibold text-white">{loading ? 'Please wait...' : 'Next'}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default Step1
