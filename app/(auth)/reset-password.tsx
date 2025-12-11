import { useState } from 'react'
import { Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { useRequestPasswordResetMutation } from '@/store/features/auth/authApi'

const ResetPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [requestReset, { isLoading }] = useRequestPasswordResetMutation()

    const onSubmit = async () => {
        setError(null)
        setSuccess(null)
        const trimmedEmail = email.trim()
        if (!trimmedEmail) {
            setError('Email is required')
            return
        }
        try {
            const response = await requestReset({ email: trimmedEmail }).unwrap()
            setSuccess(response?.message ?? 'If this email exists, a password reset link has been sent')
            setEmail('')
        } catch (err) {
            setError((err as { data?: { message?: string } })?.data?.message ?? 'Failed to send reset email')
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAwareScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 24,
                    }}
                    keyboardShouldPersistTaps="handled"
                    bottomOffset={24}
                >
                    <View className="w-full max-w-md gap-4">
                        <Text className="text-2xl font-bold text-black">Reset Password</Text>
                        <Text className="text-base text-gray-700">Enter your email and we&apos;ll send a reset link if an account exists.</Text>

                        <View className="gap-2">
                            <Text className="text-sm text-gray-600">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email"
                                editable={!isLoading}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                className="w-full rounded-md border border-gray-300 px-4 py-3"
                            />
                        </View>

                        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
                        {success ? <Text className="text-sm text-green-600">{success}</Text> : null}

                        <Pressable
                            onPress={onSubmit}
                            disabled={isLoading || !email.trim()}
                            className={`w-full items-center rounded-md px-4 py-3 ${isLoading || !email.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
                        >
                            <Text className="text-base font-semibold text-white">{isLoading ? 'Sending...' : 'Send reset link'}</Text>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default ResetPassword
