import { Link } from 'expo-router'
import { useState } from 'react'
import { Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { LoginPayload } from '@/services/auth/auth.types'
import { loginThunk } from '@/store/features/auth/auth.thunks'
import { selectAuthStatus } from '@/store/features/auth/auth.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const SignIn = () => {
    const dispatch = useAppDispatch()
    const status = useAppSelector(selectAuthStatus)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async () => {
        setError(null)
        const payload: LoginPayload = { email: email.trim(), password }
        try {
            await dispatch(loginThunk(payload)).unwrap()
        } catch (err) {
            setError((err as Error)?.message ?? 'Login failed')
        }
    }

    const isLoading = status === 'loading'

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
                        <Text className="text-2xl font-bold text-black">Sign In</Text>

                        <View className="gap-2">
                            <Text className="text-sm text-gray-600">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email"
                                editable={!isLoading}
                                autoCapitalize="none"
                                className="w-full rounded-md border border-gray-300 px-4 py-3"
                            />
                        </View>

                        <View className="gap-2">
                            <Text className="text-sm text-gray-600">Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter password"
                                secureTextEntry
                                editable={!isLoading}
                                className="w-full rounded-md border border-gray-300 px-4 py-3"
                            />
                        </View>

                        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

                        <Pressable
                            onPress={onSubmit}
                            disabled={isLoading || !email || !password}
                            className={`w-full items-center rounded-md px-4 py-3 ${isLoading || !email || !password ? 'bg-gray-300' : 'bg-blue-600'}`}
                        >
                            <Text className="text-base font-semibold text-white">{isLoading ? 'Signing in...' : 'Sign In'}</Text>
                        </Pressable>

                        <Link href="/(auth)/sign-up" className="text-center text-blue-500">
                            Go to Sign Up
                        </Link>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SignIn
