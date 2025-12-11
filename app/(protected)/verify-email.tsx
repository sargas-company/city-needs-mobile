import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { refreshEmailVerificationStatusThunk } from '@/store/features/auth/auth.thunks'
// import { setEmailVerificationSkipped } from '@/store/features/auth/auth.slice'
import { selectProfileUser } from '@/store/features/profile/profile.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const VerifyEmail = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const profileUser = useAppSelector(selectProfileUser)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setLoading(true)
        setMessage(null)
        setError(null)
        try {
            await dispatch(refreshEmailVerificationStatusThunk()).unwrap()
            setMessage('Email verified successfully.')
            router.replace('/(protected)/gate')
        } catch (err) {
            const code = (err as string) ?? ''
            if (code === 'NO_USER') {
                setError('Session expired. Please sign in again.')
                router.replace('/(auth)/sign-in')
            } else if (code === 'NOT_VERIFIED') {
                setError("We still don't see your email as verified. Please tap the link in the email, then try again.")
            } else {
                setError('Could not refresh verification status. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        // dispatch(setEmailVerificationSkipped(true))
        router.replace('/(protected)/gate')
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="flex-1 items-center justify-center gap-4">
                <View className="w-full max-w-md gap-2">
                    <Text className="text-2xl font-bold text-black">Verify your email</Text>
                    <Text className="text-base text-gray-700">
                        {`We’ve sent a verification email${profileUser?.email ? ` to ${profileUser.email}` : ''}. Please check your inbox and click the link.`}
                    </Text>
                </View>

                {message ? <Text className="text-base text-green-600">{message}</Text> : null}
                {error ? <Text className="text-base text-red-600">{error}</Text> : null}

                <View className="w-full max-w-md gap-3">
                    <Pressable
                        onPress={handleConfirm}
                        disabled={loading}
                        className={`w-full items-center rounded-md px-4 py-3 ${loading ? 'bg-gray-300' : 'bg-blue-600'}`}
                    >
                        <Text className="text-base font-semibold text-white">{loading ? 'Checking...' : 'I confirmed my email'}</Text>
                    </Pressable>
                    {/*<Pressable onPress={handleSkip} disabled={loading} className="w-full items-center rounded-md border border-gray-300 px-4 py-3">*/}
                    {/*    <Text className="text-base font-semibold text-gray-800">Skip – confirm later</Text>*/}
                    {/*</Pressable>*/}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default VerifyEmail
