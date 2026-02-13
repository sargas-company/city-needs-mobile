import { Link } from 'expo-router'
import { useState } from 'react'
import { Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons'

import { LoginPayload } from '@/services/auth/auth.types'
import { loginThunk } from '@/store/features/auth/auth.thunks'
import { selectAuthStatus } from '@/store/features/auth/auth.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FormInput } from '@/components/ui/FormInput'
import { AppButton } from '@/components/ui/AppButton'

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
            //email: 'onora.arsema@minuteafter.com',
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

    const SocialButton = ({ children }: { children: React.ReactNode }) => {
        return (
            <TouchableOpacity activeOpacity={0.8} className="w-[30%] h-14 rounded-xl bg-white items-center justify-center border border-gray-200">
                {children}
            </TouchableOpacity>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-white pt-[130]">
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
                        <Text className="text-3xl font-bold text-brand text-center w-full">Your local community{'\n'}starts here.</Text>

                        <FormInput<SignInFormValues>
                            control={control}
                            name="email"
                            label="Email address"
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
                            rightIcon={<Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#CBCBCB" />}
                            onRightIconPress={() => setShowPassword((prev) => !prev)}
                        />

                        <AppButton
                            title={isLoading ? 'Logging in…' : 'Log In'}
                            onPress={handleSubmit(onSubmit)}
                            loading={isLoading}
                            disabled={isLoading}
                            className="mt-2"
                        />

                        {submitError ? <Text className="mt-2 text-sm text-red-600 text-center">{submitError}</Text> : null}

                        <Link href="/(auth)/reset-password" className="text-center font-semibold text-brand  leading-[21px] tracking-normal">
                            Forgot password?
                        </Link>

                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-px bg-gray-300" />
                            <Text className="mx-4 text-gray-400 text-sm">Or login with</Text>
                            <View className="flex-1 h-px bg-gray-300" />
                        </View>

                        <View className="flex-row justify-between mb-8">
                            <SocialButton>
                                <AntDesign name="google" size={22} color="#DB4437" />
                            </SocialButton>

                            <SocialButton>
                                <FontAwesome name="facebook" size={22} color="#1877F2" />
                            </SocialButton>

                            <SocialButton>
                                <AntDesign name="apple" size={22} color="#000" />
                            </SocialButton>
                        </View>

                        <View className="flex-row justify-center">
                            <Text className="text-base text-black">New here? </Text>
                            <Link href="/(auth)/sign-up" className="text-base text-yellow-600 font-semibold">
                                Create an account
                            </Link>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SignIn
