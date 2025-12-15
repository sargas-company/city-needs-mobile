import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TouchableWithoutFeedback, View, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormInput } from '@/components/ui/FormInput'
import { FormPhoneInput } from '@/components/ui/FormPhoneInput'
import { SignUpPayload } from '@/services/auth/auth.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAuthStatus } from '@/store/features/auth/auth.selectors'
import { signUpThunk } from '@/store/features/auth/auth.thunks'
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter'
import TermsModal from '@/components/modals/TermsModal'

const signUpSchema = z
    .object({
        fullName: z.string().min(2, 'Full name is required'),
        phone: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true
                const digits = val.replace(/\D/g, '')
                return digits.length >= 10 && digits.length <= 15
            }, 'Enter a valid phone number'),
        email: z.string().min(1, 'Email is required').email('Enter a valid email'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least 1 letter and 1 number'),
        confirmPassword: z.string(),
        termsAccepted: z.boolean().refine((val) => val === true, {
            message: 'You must accept the Terms & Privacy Policy',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type SignUpFormValues = z.infer<typeof signUpSchema>

type CheckboxFieldProps = {
    value: boolean
    onChange: (val: boolean) => void
    error?: string
    onPressTerms: () => void
}
const CheckboxField = ({ value, onChange, error, onPressTerms }: CheckboxFieldProps) => {
    return (
        <View className="mt-3 w-full">
            <Pressable
                onPress={() => onChange(!value)}
                className="flex-row items-start gap-3"
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
            >
                <View
                    className={`h-5 w-5 items-center justify-center rounded border ${
                        value ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'
                    }`}
                >
                    {value ? <Text className="text-xs font-semibold text-white">✓</Text> : null}
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                    By continuing, you agree to our{' '}
                    <Text className="text-blue-600 underline" onPress={onPressTerms}>
                        Terms & Privacy Policy
                    </Text>
                </Text>
            </Pressable>
            {!!error && <Text className="mt-1 text-xs font-semibold text-red-600">{error}</Text>}
        </View>
    )
}

const SignUp = () => {
    const dispatch = useAppDispatch()
    const status = useAppSelector(selectAuthStatus)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isTermsVisible, setIsTermsVisible] = useState(false)

    const {
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const passwordValue = watch('password')
    const confirmPasswordValue = watch('confirmPassword')
    const isLoading = status === 'loading' || isSubmitting

    const onSubmit = async (values: SignUpFormValues) => {
        setSubmitError(null)
        const digitsPhone = values.phone ? values.phone.replace(/\D/g, '') : undefined

        const payload: SignUpPayload = {
            username: values.fullName.trim(),
            email: values.email.trim(),
            password: values.password,
            phone: digitsPhone,
        }
        try {
            await dispatch(signUpThunk(payload)).unwrap()
        } catch (err) {
            let message = 'Sign up failed. Please try again.'
            if (typeof err === 'string') {
                message = err
            } else if (err instanceof Error && err.message) {
                message = err.message
            }
            setSubmitError(message)
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
                    <View className="w-full max-w-md self-center gap-6">
                        <View className="mb-2">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-2xl font-bold text-[#0C2A63]">Create Your Account</Text>
                            </View>
                            <Text className="mt-2 text-sm text-gray-600">Sign up to find trusted services and real local talent in minutes.</Text>
                        </View>

                        <FormInput<SignUpFormValues>
                            control={control}
                            name="fullName"
                            label="Full Name"
                            required
                            placeholder="Name"
                            editable={!isLoading}
                        />

                        <FormPhoneInput<SignUpFormValues>
                            control={control}
                            name="phone"
                            label="Mobile Number"
                            placeholder="+1 (___) ___-____"
                            leftIcon={<Text className="text-lg">🇨🇦</Text>}
                        />

                        <FormInput<SignUpFormValues>
                            control={control}
                            name="email"
                            label="Email address"
                            required
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!isLoading}
                        />

                        <View className="gap-2">
                            <FormInput<SignUpFormValues>
                                control={control}
                                name="password"
                                label="Password"
                                required
                                placeholder="●●●●●"
                                secureTextEntry
                                editable={!isLoading}
                            />
                            <PasswordStrengthMeter password={passwordValue} />
                        </View>

                        <View className="gap-2">
                            <FormInput<SignUpFormValues>
                                control={control}
                                name="confirmPassword"
                                label="Confirm Password"
                                required
                                placeholder="●●●●●"
                                secureTextEntry
                                editable={!isLoading}
                            />
                            <PasswordStrengthMeter password={confirmPasswordValue} />
                        </View>

                        <Controller
                            control={control}
                            name="termsAccepted"
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <CheckboxField
                                    value={value}
                                    onChange={onChange}
                                    error={error?.message}
                                    onPressTerms={() => setIsTermsVisible(true)}
                                />
                            )}
                        />

                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className={`mt-2 w-full items-center rounded-full bg-blue-600 px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                        >
                            <Text className="text-base font-semibold text-white">{isLoading ? 'Creating...' : 'Create an Account'}</Text>
                        </Pressable>

                        {submitError ? <Text className="text-center text-sm text-red-600">{submitError}</Text> : null}

                        <View className="mt-4 items-center gap-2">
                            <Text className="text-sm text-gray-600">
                                Already Have An Account?{' '}
                                <Link href="/(auth)/sign-in" className="text-blue-600">
                                    Login
                                </Link>
                            </Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <TermsModal visible={isTermsVisible} onClose={() => setIsTermsVisible(false)} />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SignUp
