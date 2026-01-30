import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { refreshEmailVerificationStatusThunk } from '@/store/features/auth/auth.thunks'
import { useAppDispatch } from '@/store/hooks'
import { AppButton } from '@/components/ui/AppButton'

const RESEND_COOLDOWN_SEC = 120

const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const VerifyEmail = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const [confirmLoading, setConfirmLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)

    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [resendLeft, setResendLeft] = useState<number>(RESEND_COOLDOWN_SEC)

    useEffect(() => {
        if (resendLeft <= 0) return
        const id = setInterval(() => {
            setResendLeft((p) => (p <= 1 ? 0 : p - 1))
        }, 1000)
        return () => clearInterval(id)
    }, [resendLeft])

    const handleConfirm = async () => {
        setConfirmLoading(true)
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
            setConfirmLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendLeft > 0 || resendLoading) return

        setResendLoading(true)
        setMessage(null)
        setError(null)

        try {
            // sendEmailVerification(auth.currentUser)
            //  dispatch(resendEmailVerificationThunk()).unwrap()

            setMessage('Verification email sent again.')
            setResendLeft(RESEND_COOLDOWN_SEC)
        } catch {
            setError('Could not resend email. Please try again.')
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-8">
                <View className="items-center">
                    <Ionicons name="mail" size={90} color="#e89f48" />

                    <Text className="mt-6 text-3xl font-extrabold text-brand text-center">You&apos;re almost there!</Text>

                    <Text className="mt-3 text-center text-base text-gray-400">
                        {/*{`We’ve sent a verification code to your email ${profileUser?.email ? ` (${profileUser.email})` : ''} to continue.`}*/}
                        We’ve sent a verification code to your email.
                    </Text>

                    <Text className="mt-8 text-6xl font-extrabold text-brand">{formatMMSS(resendLeft)}</Text>

                    <View className="mt-6 flex-row items-center gap-2">
                        <Text className="text-base text-gray-400">Didn’t receive it?</Text>

                        <Pressable onPress={handleResend} disabled={resendLeft > 0 || resendLoading}>
                            <Text className={['text-base font-semibold', resendLeft > 0 || resendLoading ? 'text-gray-400' : 'text-brand'].join(' ')}>
                                {/*{resendText}*/}
                                Resend email
                            </Text>
                        </Pressable>
                    </View>

                    {!!message && <Text className="mt-4 text-base text-green-600">{message}</Text>}
                    {!!error && <Text className="mt-4 text-base text-red-600 text-center">{error}</Text>}
                </View>

                <View className="flex-1" />

                <AppButton title="Verify and Continue" onPress={handleConfirm} loading={confirmLoading} disabled={confirmLoading} className="mt-2" />

                <Text className="mt-4 mb-6 text-center text-xs text-gray-400">
                    If you didn’t receive the email, check spam or resend when available.
                </Text>
            </View>
        </SafeAreaView>
    )
}

export default VerifyEmail
