import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { performLogin } from '@/services/auth/auth.actions'
import { LoginPayload } from '@/services/auth/auth.types'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectAuthStatus } from '@/store/auth/auth.slice'

const SignIn = () => {
    const dispatch = useAppDispatch()
    const status = useAppSelector(selectAuthStatus)
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async () => {
        setError(null)
        const payload: LoginPayload = { username: identifier, password }
        try {
            await performLogin(dispatch, payload)
        } catch (err) {
            setError((err as Error)?.message ?? 'Login failed')
        }
    }

    const isLoading = status === 'loading'

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <View className="w-full max-w-md gap-4">
                <Text className="text-2xl font-bold text-black">Sign In</Text>

                <View className="gap-2">
                    <Text className="text-sm text-gray-600">Email or Username</Text>
                    <TextInput
                        value={identifier}
                        onChangeText={setIdentifier}
                        placeholder="Enter email or username"
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
                    disabled={isLoading || !identifier || !password}
                    className={`w-full items-center rounded-md px-4 py-3 ${isLoading || !identifier || !password ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                    <Text className="text-base font-semibold text-white">{isLoading ? 'Signing in...' : 'Sign In'}</Text>
                </Pressable>

                <Link href="/(auth)/sign-up" className="text-center text-blue-500">
                    Go to Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
