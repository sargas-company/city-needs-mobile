import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useRouter } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus } from '@/store/features/profile/profile.selectors'
import {
    deleteVerificationFileThunk,
    loadVerificationFileThunk,
    submitVerificationThunk,
    skipVerificationThunk,
    uploadVerificationFileThunk,
} from '@/store/features/onboarding/verify/verify.thunks'
import { selectVerifyError, selectVerifyFile, selectVerifyStatus } from '@/store/features/onboarding/verify/verify.selectors'

type VerifyState = 'empty' | 'pending' | 'failed' | 'verified'

const statusColors: Record<VerifyState, string> = {
    pending: '#F59E0B',
    failed: '#EF4444',
    verified: '#10B981',
    empty: '#9CA3AF',
}

const VerifyScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)

    const [verifyState, setVerifyState] = useState<VerifyState>('empty')
    const [localError, setLocalError] = useState<string | null>(null)

    const verifyFile = useAppSelector(selectVerifyFile)
    const verifyStatus = useAppSelector(selectVerifyStatus)
    const verifyError = useAppSelector(selectVerifyError)

    const isBusy = profileStatus === 'loading' || verifyStatus === 'loading' || verifyStatus === 'submitting'
    const canDelete = verifyFile ? !(verifyFile as { lock?: { locked?: boolean } }).lock?.locked : false
    const canSubmit = !!verifyFile?.id && verifyState !== 'verified'

    useEffect(() => {
        dispatch(loadVerificationFileThunk())
    }, [dispatch])

    const title = useMemo(() => {
        switch (verifyState) {
            case 'pending':
                return 'Verification in progress'
            case 'failed':
                return 'Verification Failed'
            case 'verified':
                return 'Business Verified'
            default:
                return 'Verify your business'
        }
    }, [verifyState])

    const description = useMemo(() => {
        switch (verifyState) {
            case 'pending':
                return 'Your document is being reviewed. This helps keep our community safe and trusted'
            case 'failed':
                return "We couldn't verify your document. Please upload a different document to continue."
            case 'verified':
                return 'Your business has been successfully verified.'
            default:
                return 'This helps build trust with users'
        }
    }, [verifyState])

    const infoBadge = useMemo(() => {
        switch (verifyState) {
            case 'pending':
                return "Reviews usually take up to 24–48 hours. You'll be notified once it's completed."
            case 'failed':
                return 'Make sure the document is clear and valid'
            case 'verified':
                return 'Your profile is now trusted by users'
            default:
                return 'Only one document is required. Verification is done once.'
        }
    }, [verifyState])

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: false,
            type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
            copyToCacheDirectory: true,
        })
        if (result.canceled || !result.assets?.length) return
        const asset = result.assets[0]
        try {
            await dispatch(
                uploadVerificationFileThunk({
                    uri: asset.uri,
                    name: asset.name || asset.uri.split('/').pop() || 'document',
                    type: asset.mimeType || 'application/octet-stream',
                })
            ).unwrap()
            setVerifyState('empty')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload file'
            setLocalError(message)
        }
    }

    const handleSubmit = async () => {
        setLocalError(null)
        if (!verifyFile?.id) {
            setLocalError('Please upload a document to submit for verification.')
            return
        }
        try {
            await dispatch(submitVerificationThunk()).unwrap()
            setVerifyState('pending')
            router.replace('/(protected)/(tabs)')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit verification'
            setLocalError(message)
        }
    }

    const handleSkip = async () => {
        setLocalError(null)
        try {
            await dispatch(skipVerificationThunk()).unwrap()
            router.replace('/(protected)/(tabs)')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to skip verification'
            setLocalError(message)
        }
    }

    const handleContinue = () => {
        router.replace('/(protected)/(tabs)')
    }

    const renderStatusRow = () => {
        if (!verifyFile) return null

        const pillColor = statusColors[verifyState] ?? '#9CA3AF'
        const pillLabel = verifyState === 'pending' ? 'Pending' : verifyState === 'failed' ? 'Failed' : 'Verified'
        const name = verifyFile.originalName || verifyFile.url || 'Uploaded document'

        return (
            <View className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                <Text className="flex-1 text-base text-[#111827]" numberOfLines={2}>
                    {name}
                </Text>
                <View className="ml-3 rounded-full px-3 py-1" style={{ backgroundColor: `${pillColor}22` }}>
                    <Text className="text-xs font-semibold" style={{ color: pillColor }}>
                        {pillLabel}
                    </Text>
                </View>
            </View>
        )
    }

    const showUpload = !verifyFile
    const showSubmit = true
    const primaryLabel = verifyState === 'verified' ? 'Continue' : 'Submit for Verification'

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
            >
                <View className="mt-4 mb-6 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 items-center justify-center rounded-full border border-gray-300"
                        accessibilityRole="button"
                    >
                        <Text className="text-lg text-[#0C2A63]">‹</Text>
                    </Pressable>
                    <Pressable onPress={handleSkip} disabled={isBusy}>
                        <Text className="text-base font-semibold text-[#0C2A63]">Skip for now</Text>
                    </Pressable>
                </View>

                <View className="mb-4">
                    <Text className="text-base font-semibold text-[#111827]">Your Progress</Text>
                    <View className="mt-3 flex-row items-center gap-2">
                        <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                        <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                        <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                        <View className="h-1.5 flex-1 rounded-full bg-[#F59E0B]" />
                    </View>
                    <Text className="mt-2 text-sm font-medium text-[#0C2A63]">Step 4 of 4 · Verification</Text>
                </View>

                <View className="mb-6">
                    <Text className="text-xl font-bold text-[#0C2A63]">{title}</Text>
                    <Text className="mt-1 text-base text-[#4B5563]">{description}</Text>
                </View>

                {renderStatusRow()}

                {showUpload ? (
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-[#111827]">Upload document any of the following</Text>
                        <Pressable
                            onPress={pickDocument}
                            className="mt-3 items-center justify-center rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6"
                        >
                            <Text className="text-3xl text-[#9CA3AF]">⬆</Text>
                            <Text className="mt-2 text-base font-semibold text-[#0C2A63]">Upload your document</Text>
                            <Text className="mt-1 text-center text-xs text-gray-500">Business reg, GST, license, utility bill</Text>
                        </Pressable>
                    </View>
                ) : null}

                {verifyFile ? (
                    <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="flex-1 text-base text-[#111827]" numberOfLines={2}>
                                {verifyFile.originalName || verifyFile.url || 'Uploaded document'}
                            </Text>
                            {canDelete ? (
                                <Pressable
                                    onPress={async () => {
                                        if (!verifyFile?.id) return
                                        try {
                                            await dispatch(deleteVerificationFileThunk(verifyFile.id)).unwrap()
                                            setVerifyState('empty')
                                        } catch (err) {
                                            const message =
                                                (err as { data?: { message?: string }; error?: { data?: { message?: string } } })?.data?.message ??
                                                (err as { error?: { data?: { message?: string } } })?.error?.data?.message ??
                                                'Failed to delete file'
                                            setLocalError(message)
                                        }
                                    }}
                                >
                                    <Text className="text-sm text-red-500">Remove</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                ) : null}

                <View className="mb-6 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-3">
                    <Text className="text-xs font-semibold text-[#0C2A63]">{infoBadge}</Text>
                </View>

                {!!verifyError && <Text className="mb-2 text-sm font-semibold text-red-600">{verifyError}</Text>}
                {!!localError && <Text className="mb-2 text-sm font-semibold text-red-600">{localError}</Text>}

                {showSubmit || verifyState === 'verified' ? (
                    <View className="mt-2">
                        <Pressable
                            onPress={verifyState === 'verified' ? handleContinue : handleSubmit}
                            disabled={isBusy || !canSubmit}
                            className={`w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${isBusy || !canSubmit ? 'opacity-60' : ''}`}
                        >
                            <Text className="text-base font-semibold text-white">{primaryLabel}</Text>
                        </Pressable>
                    </View>
                ) : null}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default VerifyScreen
