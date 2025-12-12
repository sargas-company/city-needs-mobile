import { Link } from 'expo-router'
import { useState } from 'react'
import { Keyboard, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Feather } from '@expo/vector-icons'

import { LoginPayload } from '@/services/auth/auth.types'
import { loginThunk } from '@/store/features/auth/auth.thunks'
import { selectAuthStatus } from '@/store/features/auth/auth.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FormInput } from '@/components/ui/FormInput'

const signInSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormValues = z.infer<typeof signInSchema>

const SignIn = () => {
    const dispatch = useAppDispatch()
    const status = useAppSelector(selectAuthStatus)

    const [submitError, setSubmitError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const onSubmit = async (values: SignInFormValues) => {
        setSubmitError(null)

        const payload: LoginPayload = {
            email: values.email.trim(),
            password: values.password,
        }

        try {
            await dispatch(loginThunk(payload)).unwrap()
        } catch (err) {
            const message = typeof err === 'string' ? err : ((err as Error)?.message ?? 'Login failed. Please try again.')
            setSubmitError(message)
        }
    }

    const isLoading = status === 'loading' || isSubmitting
    const isDisabled = isLoading

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
                    <View className="w-full max-w-md self-center gap-6">
                        <Text className="text-2xl font-bold text-black">Sign In</Text>

                        <FormInput<SignInFormValues>
                            control={control}
                            name="email"
                            label="Email"
                            required
                            placeholder="Enter email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!isLoading}
                        />

                        <FormInput<SignInFormValues>
                            control={control}
                            name="password"
                            label="Password"
                            required
                            placeholder="Enter password"
                            secureTextEntry={!showPassword}
                            editable={!isLoading}
                            rightIcon={<Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#171717" />}
                            onRightIconPress={() => setShowPassword((prev) => !prev)}
                        />

                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={isDisabled}
                            className={`mt-2 w-full items-center rounded-md px-4 py-3 bg-blue-600 ${isDisabled ? 'opacity-60' : ''}`}
                        >
                            <Text className="text-base font-semibold text-white">{isLoading ? 'Signing in...' : 'Sign In'}</Text>
                        </Pressable>

                        {submitError ? <Text className="mt-2 text-sm text-red-600 text-center">{submitError}</Text> : null}

                        {/* Линки */}
                        <View className="mt-4 items-center gap-2">
                            <Link href="/(auth)/sign-up" className="text-center text-blue-500">
                                Go to Sign Up
                            </Link>
                            <Link href="/(auth)/reset-password" className="text-center text-blue-500">
                                Forgot password?
                            </Link>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SignIn
