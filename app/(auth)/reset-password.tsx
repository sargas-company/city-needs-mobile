import { Keyboard, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

import { AppText } from '@/components/ui/AppText'
import { FormInput } from '@/components/ui/FormInput'
import { useRequestPasswordResetMutation } from '@/store/features/auth/authApi'

const resetSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

type ResetFormValues = z.infer<typeof resetSchema>

const ResetPassword = () => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [requestReset, { isLoading }] = useRequestPasswordResetMutation()

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const onSubmit = async (values: ResetFormValues) => {
        setSubmitError(null)
        setSubmitSuccess(null)
        try {
            const response = await requestReset({ email: values.email.trim() }).unwrap()
            setSubmitSuccess(response?.message ?? 'If this email exists, a password reset link has been sent')
            reset({ email: '' })
        } catch (err) {
            const message = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to send reset email'
            setSubmitError(message)
        }
    }

    const disabled = isLoading || isSubmitting

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
                        <View className="gap-2">
                            <Text className="text-3xl font-bold text-brand ">Reset Password.</Text>
                            <AppText className="text-sm text-text-muted">
                                Enter your email and we&apos;ll send a reset link if an account exists.
                            </AppText>
                        </View>

                        <FormInput<ResetFormValues>
                            control={control}
                            name="email"
                            label="Email"
                            required
                            placeholder="Enter email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!disabled}
                        />

                        {submitError ? <AppText className="text-sm text-danger">{submitError}</AppText> : null}
                        {submitSuccess ? <AppText className="text-sm text-brand">{submitSuccess}</AppText> : null}

                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={disabled}
                            className={`w-full items-center rounded-full bg-brand px-4 py-3 ${disabled ? 'opacity-60' : ''}`}
                        >
                            <AppText className="text-base font-semibold text-white">{disabled ? 'Sending...' : 'Send reset link'}</AppText>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default ResetPassword
