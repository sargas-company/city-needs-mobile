import React, { useEffect, useMemo, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useRouter } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus, selectVerification } from '@/store/features/profile/profile.selectors'
import {
    deleteVerificationFileThunk,
    loadVerificationFileThunk,
    skipVerificationThunk,
    submitVerificationThunk,
    uploadVerificationFileThunk,
} from '@/store/features/onboarding/verify/verify.thunks'
import { selectVerifyError, selectVerifyFile, selectVerifyStatus } from '@/store/features/onboarding/verify/verify.selectors'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { AppText } from '@/components/ui/AppText'

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
    const verificationGate = useAppSelector(selectVerification)

    const verifyFile = useAppSelector(selectVerifyFile)
    const verifyStatus = useAppSelector(selectVerifyStatus)
    const verifyError = useAppSelector(selectVerifyError)

    const [localError, setLocalError] = useState<string | null>(null)

    useEffect(() => {
        dispatch(loadVerificationFileThunk())
    }, [dispatch])

    const requiresVerification = verificationGate?.requiresVerification === true
    const graceExpired = verificationGate?.graceExpired === true

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
    const canUpload = !isLocked && requiresVerification
    const canDelete = !!verifyFile?.id && !isLocked
    const canSubmit = !!verifyFile?.id && !isLocked && requiresVerification
    const canSkip = !isLocked && (!requiresVerification || !graceExpired)
    const showSkip = canSkip

    const title = useMemo(() => {
        if (!requiresVerification) return 'Verification not required'
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
    }, [uiState, requiresVerification])

    const description = useMemo(() => {
        if (!requiresVerification) return 'Your category does not require verification.'
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
    }, [uiState, requiresVerification])

    const infoBadge = useMemo(() => {
        if (!requiresVerification) return 'You can continue without verification.'
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
    }, [uiState, requiresVerification])

    const pickDocument = async () => {
        setLocalError(null)
        if (!canUpload) return

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

        if (!requiresVerification) {
            setLocalError('Verification is not required for your category.')
            return
        }
        if (!verifyFile?.id) {
            setLocalError('Please upload a document to submit for verification.')
            return
        }
        if (isLocked) return

        try {
            await dispatch(submitVerificationThunk()).unwrap()
            router.replace('/(protected)/(tabs)')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit verification'
            setLocalError(message)
        }
    }

    const handleSkip = async () => {
        setLocalError(null)

        if (!canSkip) {
            setLocalError('Grace period is expired. Verification is required to continue.')
            return
        }

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

    const showUploadZone = canUpload && (uiState === 'empty' || uiState === 'failed')
    const showPrimary = true

    const primaryMode: 'continue' | 'pending' | 'submit' =
        uiState === 'verified' ? 'continue' : uiState === 'pending' ? 'pending' : !requiresVerification ? 'continue' : 'submit'
    const primaryLabel = primaryMode === 'continue' ? 'Continue' : primaryMode === 'pending' ? 'Verification Pending' : 'Submit for Verification'

    const primaryDisabled = isBusy || primaryMode === 'pending' || (primaryMode === 'submit' && !canSubmit)

    const handlePrimaryPress = () => {
        if (primaryMode === 'continue') return handleContinue()
        if (primaryMode === 'submit') return handleSubmit()
    }

    const steps = ['Business Info', 'Address', 'Branding', 'Verification']
    const currentStep = 4

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                bottomOffset={24}
                onScrollBeginDrag={Keyboard.dismiss}
            >
                <View className="flex-row items-end justify-end">
                    {showSkip ? (
                        <Pressable onPress={handleSkip} disabled={isBusy}>
                            <Text className={`text-base font-semibold text-[#0C2A63] ${isBusy ? 'opacity-60' : ''}`}>Skip for now</Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="mb-2 gap-2">
                    <ProgressStepper steps={steps} currentStep={currentStep} showLabels showFooter />
                    <Text className="text-2xl font-bold text-[#0C2A63]">{title}</Text>
                    <Text className="text-sm text-gray-600">{description}</Text>
                </View>

                {renderFileRow()}

                {showUploadZone ? (
                    <View className="mb-4">
                        <AppText>Upload document (any of the following)</AppText>
                        <Pressable
                            onPress={pickDocument}
                            disabled={isBusy || !canUpload}
                            className={`mt-3 items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-border px-6 py-8 ${
                                isBusy || !canUpload ? 'opacity-60' : ''
                            }`}
                        >
                            <Feather name="upload" size={35} color="#3a3a3a" />
                            <AppText className={'mt-3'}>Upload your document</AppText>
                            <AppText className={'mt-3 text-text-muted text-xs'}>Business reg, GST, license, utility bill</AppText>
                        </Pressable>
                    </View>
                ) : null}

                <View className="mb-6 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-3">
                    <Text className="text-xs font-semibold text-[#0C2A63]">{infoBadge}</Text>
                </View>

                {!!verifyError && <Text className="mb-2 text-sm font-semibold text-red-600">{verifyError}</Text>}
                {!!localError && <Text className="mb-2 text-sm font-semibold text-red-600">{localError}</Text>}

                {showPrimary ? (
                    <View className="mt-auto">
                        <Pressable
                            onPress={handlePrimaryPress}
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
