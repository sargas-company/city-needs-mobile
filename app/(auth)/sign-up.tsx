import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { SignUpPayload } from '@/services/auth/auth.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAuthStatus } from '@/store/features/auth/auth.selectors'
import { signUpThunk } from '@/store/features/auth/auth.thunks'

const SignUp = () => {
    const dispatch = useAppDispatch()
    const status = useAppSelector(selectAuthStatus)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async () => {
        setError(null)
        const payload: SignUpPayload = {
            email: email.trim(),
            password,
            username: 'Demo User',
            avatar: 'https://example.com/avatar.png',
            role: 'BUSINESS_OWNER',
        }
        try {
            await dispatch(signUpThunk(payload)).unwrap()
        } catch (err) {
            setError((err as Error)?.message ?? 'Sign up failed')
        }
    }

    const isLoading = status === 'loading'

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <View className="w-full max-w-md gap-4">
                <Text className="text-2xl font-bold text-black">Sign Up</Text>
                <Text className="text-base text-gray-600">Create an account with your email and password.</Text>

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
                    <Text className="text-base font-semibold text-white">{isLoading ? 'Submitting...' : 'Sign Up'}</Text>
                </Pressable>

                <Link href="/(auth)/sign-in" className="text-center text-blue-500">
                    Go to Sign In
                </Link>
            </View>
        </View>
    )
}

export default SignUp
