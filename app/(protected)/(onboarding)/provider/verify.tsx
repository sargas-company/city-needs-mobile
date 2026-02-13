import React, { useEffect, useMemo, useState } from 'react'
import { Keyboard, Linking, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useRouter } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus, selectVerification } from '@/store/features/profile/profile.selectors'
import { logoutThunk } from '@/store/features/auth/auth.thunks'
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
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

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
    const canUseApp = verificationGate?.canUseApp !== false
    const businessStatus = verificationGate?.status

    const lockStatus = verifyFile?.lock?.status
    const rejectionReason = verifyFile?.lock?.rejectionReason

    const uiState: VerifyUiState = useMemo(() => {
        // Check lock status from file first
        if (lockStatus === 'PENDING') return 'pending'
        if (lockStatus === 'APPROVED') return 'verified'
        if (lockStatus === 'REJECTED') return 'failed'
        // If file exists without lock, it's a draft (even if business is rejected)
        if (verifyFile) return 'draft'
        // Fallback to business status from gate (only when NO file exists)
        if (businessStatus === 'PENDING') return 'pending'
        if (businessStatus === 'REJECTED') return 'failed'
        // No file
        return 'empty'
    }, [verifyFile, lockStatus, businessStatus])

    const isBusy = profileStatus === 'loading' || verifyStatus === 'loading' || verifyStatus === 'submitting'

    const isLocked = uiState === 'pending' || uiState === 'verified'
    const canUpload = !isLocked
    // Cannot delete rejected files - they stay for history
    const canDelete = !!verifyFile?.id && !isLocked && uiState !== 'failed'
    const canSkip = !isLocked && (!requiresVerification || !graceExpired)
    const showSkip = canSkip

    const title = useMemo(() => {
        if (!requiresVerification) return 'Verification not required'
        // Check business status from gate as fallback
        if (businessStatus === 'PENDING' || uiState === 'pending') return 'Verification in progress'
        if (uiState === 'verified') return 'Business Verified'
        if (uiState === 'failed') return 'Verification Failed'
        return 'Verify your business'
    }, [uiState, requiresVerification, businessStatus])

    const description = useMemo(() => {
        if (!requiresVerification) return 'Your category does not require verification.'
        // Check business status from gate as fallback
        if (businessStatus === 'PENDING' || uiState === 'pending')
            return 'Your document is being reviewed. This helps keep our community safe and trusted.'
        if (uiState === 'verified') return 'Your business has been successfully verified.'
        if (uiState === 'failed') return "We couldn't verify your document. Please upload a different document."
        return 'This helps build trust with users.'
    }, [uiState, requiresVerification, businessStatus])

    const infoBadge = useMemo(() => {
        if (!requiresVerification) return 'You can continue without verification.'
        // Check business status from gate as fallback
        if (businessStatus === 'PENDING' || uiState === 'pending')
            return "Reviews usually take up to 24–48 hours. You'll be notified once it's completed."
        if (uiState === 'verified') return 'Your profile is now trusted by users.'
        if (uiState === 'failed') return 'Make sure the document is clear and valid.'
        return 'Upload 1 document (business reg, GST, license, utility bill).'
    }, [uiState, requiresVerification, businessStatus])

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
            // Don't reload - uploadVerificationFileThunk already sets the new file
            // Reloading would overwrite with rejected file from BE
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

    const handleSkip = async () => {
        setLocalError(null)

        if (!canSkip) {
            setLocalError('Grace period is expired. Verification is required to continue.')
            return
        }

        try {
            await dispatch(skipVerificationThunk()).unwrap()
            router.replace('/(protected)/business/(tabs)')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to skip verification'
            setLocalError(message)
        }
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

    const isBusinessPending = businessStatus === 'PENDING'
    const showUploadZone = !isLocked && !isBusinessPending && (uiState === 'empty' || uiState === 'failed')
    const showPrimary = true

    const hasFileToSubmit = !!verifyFile?.id && uiState === 'draft'
    const mustUploadFirst = requiresVerification && graceExpired && !verifyFile?.id

    const primaryMode: 'continue' | 'pending' | 'submit' =
        uiState === 'verified' ? 'continue' : uiState === 'pending' ? 'pending' : hasFileToSubmit ? 'submit' : 'continue'

    const primaryLabel = primaryMode === 'pending' ? 'Verification Pending' : 'Continue'

    const primaryDisabled = isBusy || primaryMode === 'pending' || mustUploadFirst

    const handlePrimaryPress = async () => {
        setLocalError(null)

        if (primaryMode === 'continue') {
            // If already verified, just navigate
            if (uiState === 'verified') {
                router.replace('/(protected)/business/(tabs)')
                return
            }
            // Otherwise, call skip to properly complete the onboarding step
            try {
                await dispatch(skipVerificationThunk()).unwrap()
                router.replace('/(protected)/business/(tabs)')
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to complete verification step'
                setLocalError(message)
            }
            return
        }

        if (primaryMode === 'submit') {
            try {
                const result = await dispatch(submitVerificationThunk()).unwrap()
                // Only navigate if user can use the app, otherwise stay on page to show pending state
                if (result.canUseApp) {
                    router.replace('/(protected)/business/(tabs)')
                }
                // If canUseApp is false, UI will automatically update to show pending state
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to submit verification'
                setLocalError(message)
            }
        }
    }

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@cityneeds.app?subject=Verification%20Help')
    }

    const handleSignOut = async () => {
        try {
            await dispatch(logoutThunk()).unwrap()
        } catch {
            // Logout failed, but we'll still try to navigate away
        }
    }

    const steps = ['Business Info', 'Address', 'Branding', 'Verification']
    const currentStep = 4

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 24 }}
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
                {renderFileRow()}

                {uiState === 'failed' && rejectionReason ? (
                    <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
                        <Text className="text-xs font-semibold text-red-600">Reason: {rejectionReason}</Text>
                    </View>
                ) : null}

                {!!verifyError && <Text className="mb-2 text-sm font-semibold text-red-600">{verifyError}</Text>}
                {!!localError && <Text className="mb-2 text-sm font-semibold text-red-600">{localError}</Text>}

                {!canUseApp && (uiState === 'pending' || businessStatus === 'PENDING') ? (
                    <View className="mt-auto items-center gap-4">
                        <Pressable onPress={handleContactSupport}>
                            <Text className="text-base text-[#0C2A63] underline">Need help? Contact Support</Text>
                        </Pressable>
                        <Pressable onPress={handleSignOut} disabled={isBusy}>
                            <Text className={`text-base text-gray-500 ${isBusy ? 'opacity-60' : ''}`}>Sign out</Text>
                        </Pressable>
                    </View>
                ) : showPrimary ? (
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
