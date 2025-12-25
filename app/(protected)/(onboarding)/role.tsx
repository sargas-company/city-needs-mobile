import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppDispatch } from '@/store/hooks'
import { selectRoleThunk } from '@/store/features/auth/auth.thunks'

const RoleScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleSelect = async (role: 'END_USER' | 'BUSINESS_OWNER') => {
        try {
            await dispatch(selectRoleThunk(role)).unwrap()
            router.replace('/(protected)/(onboarding)/location')
        } catch {
            // noop for now
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="flex-1 items-center justify-center gap-4">
                <Text className="text-2xl font-bold text-black">Select your role</Text>
                <Text className="text-base text-gray-700">Choose how you want to use the app.</Text>
                <View className="w-full max-w-md gap-3">
                    <Pressable onPress={() => handleSelect('END_USER')} className="w-full items-center rounded-lg border border-blue-600 px-4 py-3">
                        <Text className="text-base font-semibold text-blue-600">Customer</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => handleSelect('BUSINESS_OWNER')}
                        className="w-full items-center rounded-lg border border-blue-600 px-4 py-3"
                    >
                        <Text className="text-base font-semibold text-blue-600">Provider</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default RoleScreen
