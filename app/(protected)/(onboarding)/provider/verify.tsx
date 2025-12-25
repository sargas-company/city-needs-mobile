import { useEffect, useMemo, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
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

type VerifyUiState = 'empty' | 'draft' | 'pending' | 'verified' | 'failed'

const pillColors: Record<VerifyUiState, string> = {
    pending: '#F59E0B',
    failed: '#EF4444',
    verified: '#10B981',
    draft: '#0C2A63',
    empty: '#9CA3AF',
}

const VerifyScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)

    const verifyFile = useAppSelector(selectVerifyFile)
    const verifyStatus = useAppSelector(selectVerifyStatus)
    const verifyError = useAppSelector(selectVerifyError)

    const [localError, setLocalError] = useState<string | null>(null)

    useEffect(() => {
        dispatch(loadVerificationFileThunk())
    }, [dispatch])

    const lockStatus = (verifyFile as any)?.lock?.status as string | undefined

    const uiState: VerifyUiState = useMemo(() => {
        if (!verifyFile) return 'empty'
        if (lockStatus === 'PENDING') return 'pending'
        if (lockStatus === 'APPROVED') return 'verified'
        if (lockStatus === 'REJECTED') return 'failed'
        return 'draft'
    }, [verifyFile, lockStatus])

    const isBusy = profileStatus === 'loading' || verifyStatus === 'loading' || verifyStatus === 'submitting'

    const isLocked = uiState === 'pending' || uiState === 'verified'
    const canDelete = !!verifyFile?.id && !isLocked && uiState !== 'failed'
    const canSubmit = !!verifyFile?.id && !isLocked
    const canSkip = !isLocked

    const title = useMemo(() => {
        switch (uiState) {
            case 'pending':
                return 'Verification in progress'
            case 'verified':
                return 'Business Verified'
            case 'failed':
                return 'Verification Failed'
            default:
                return 'Verify your business'
        }
    }, [uiState])

    const description = useMemo(() => {
        switch (uiState) {
            case 'pending':
                return 'Your document is being reviewed. This helps keep our community safe and trusted.'
            case 'verified':
                return 'Your business has been successfully verified.'
            case 'failed':
                return "We couldn't verify your document. Please upload a different document."
            default:
                return 'This helps build trust with users.'
        }
    }, [uiState])

    const infoBadge = useMemo(() => {
        switch (uiState) {
            case 'pending':
                return "Reviews usually take up to 24–48 hours. You'll be notified once it's completed."
            case 'verified':
                return 'Your profile is now trusted by users.'
            case 'failed':
                return 'Make sure the document is clear and valid.'
            default:
                return 'Upload 1 document (business reg, GST, license, utility bill).'
        }
    }, [uiState])

    const pickDocument = async () => {
        setLocalError(null)

        if (isLocked) return

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

            await dispatch(loadVerificationFileThunk()).unwrap()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload file'
            setLocalError(message)
        }
    }

    const handleRemove = async () => {
        setLocalError(null)
        if (!verifyFile?.id) return
        if (isLocked) return

        try {
            await dispatch(deleteVerificationFileThunk(verifyFile.id)).unwrap()
            await dispatch(loadVerificationFileThunk()).unwrap()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete file'
            setLocalError(message)
        }
    }

    const handleSubmit = async () => {
        setLocalError(null)

        if (!verifyFile?.id) {
            setLocalError('Please upload a document to submit for verification.')
            return
        }
        if (isLocked) return

        try {
            await dispatch(submitVerificationThunk()).unwrap()

            await dispatch(loadVerificationFileThunk()).unwrap()

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

    const renderFileRow = () => {
        if (!verifyFile) return null

        const pillColor = pillColors[uiState] ?? '#9CA3AF'
        const pillLabel = uiState === 'pending' ? 'Pending' : uiState === 'verified' ? 'Approved' : uiState === 'failed' ? 'Rejected' : 'Uploaded'

        const name = verifyFile.originalName || verifyFile.url || 'Uploaded document'

        return (
            <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-base text-[#111827]" numberOfLines={2}>
                            {name}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${pillColor}22` }}>
                            <Text className="text-xs font-semibold" style={{ color: pillColor }}>
                                {pillLabel}
                            </Text>
                        </View>

                        {canDelete ? (
                            <Pressable onPress={handleRemove} disabled={isBusy}>
                                <Text className="text-sm text-red-500">Remove</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            </View>
        )
    }

    const showUploadZone = uiState === 'empty' || uiState === 'failed'
    const showPrimary = uiState === 'verified' || uiState === 'pending' || uiState === 'draft' || uiState === 'empty' || uiState === 'failed'

    const primaryLabel = uiState === 'verified' ? 'Continue' : uiState === 'pending' ? 'Verification Pending' : 'Submit for Verification'

    const primaryDisabled = isBusy || uiState === 'pending' || (uiState !== 'verified' && !verifyFile?.id) || (uiState !== 'verified' && isLocked)

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                bottomOffset={24}
                onScrollBeginDrag={Keyboard.dismiss}
            >
                <View className="mt-4 mb-6 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 items-center justify-center rounded-full border border-gray-300"
                        accessibilityRole="button"
                    >
                        <Text className="text-lg text-[#0C2A63]">‹</Text>
                    </Pressable>

                    {canSkip ? (
                        <Pressable onPress={handleSkip} disabled={isBusy}>
                            <Text className={`text-base font-semibold text-[#0C2A63] ${isBusy ? 'opacity-60' : ''}`}>Skip for now</Text>
                        </Pressable>
                    ) : (
                        <View />
                    )}
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

                {renderFileRow()}

                {showUploadZone ? (
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-[#111827]">Upload document (any of the following)</Text>
                        <Pressable
                            onPress={pickDocument}
                            disabled={isBusy || isLocked}
                            className={`mt-3 items-center justify-center rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 ${
                                isBusy || isLocked ? 'opacity-60' : ''
                            }`}
                        >
                            <Text className="text-3xl text-[#9CA3AF]">⬆</Text>
                            <Text className="mt-2 text-base font-semibold text-[#0C2A63]">Upload your document</Text>
                            <Text className="mt-1 text-center text-xs text-gray-500">Business reg, GST, license, utility bill</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View className="mb-6 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-3">
                    <Text className="text-xs font-semibold text-[#0C2A63]">{infoBadge}</Text>
                </View>

                {!!verifyError && <Text className="mb-2 text-sm font-semibold text-red-600">{verifyError}</Text>}
                {!!localError && <Text className="mb-2 text-sm font-semibold text-red-600">{localError}</Text>}

                {showPrimary ? (
                    <View className="mt-2">
                        <Pressable
                            onPress={uiState === 'verified' ? handleContinue : handleSubmit}
                            disabled={primaryDisabled}
                            className={`w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${primaryDisabled ? 'opacity-60' : ''}`}
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
