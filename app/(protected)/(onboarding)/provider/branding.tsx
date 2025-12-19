import { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileStatus } from '@/store/features/profile/profile.selectors'
import { submitBusinessFilesSkipThunk, submitBusinessFilesThunk } from '@/store/features/onboarding/onboarding.thunks'
import {
    bootstrapUploadSessionThunk,
    uploadSessionDeleteFileThunk,
    uploadSessionUploadFileThunk,
} from '@/store/features/uploadSession/uploadSession.thunks'
import {
    selectUploadSession,
    selectUploadSessionDocumentFiles,
    selectUploadSessionLogoFile,
    selectUploadSessionPhotoFiles,
} from '@/store/features/uploadSession/uploadSession.slice'
import { UploadSessionFileDto } from '@/services/onboarding/uploadSession.types'

type UploadSectionProps = {
    title: string
    description: string
    onPress: () => void
    required?: boolean
    icon?: string
}

type UploadedListProps = {
    title: string
    files: UploadSessionFileDto[]
    onRemove: (index: number) => void
    onClearAll?: () => void
    progress?: number
    icon?: string
    showPreview?: boolean
}

const MAX_FILES = 4

const getNameFromUri = (uri: string, fallback: string) => uri.split('/').pop() || fallback

const BrandingScreen = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const profileStatus = useAppSelector(selectProfileStatus)
    const uploadSession = useAppSelector(selectUploadSession)
    const logoFile = useAppSelector(selectUploadSessionLogoFile)
    const photoFiles = useAppSelector(selectUploadSessionPhotoFiles)
    const documentFiles = useAppSelector(selectUploadSessionDocumentFiles)

    const [error, setError] = useState<string | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)

    const isLoading = profileStatus === 'loading'

    useEffect(() => {
        dispatch(bootstrapUploadSessionThunk())
    }, [dispatch])

    const hasAnyFile = useMemo(() => {
        const total = uploadSession?.totalCount ?? 0
        return total > 0 || Boolean(logoFile || photoFiles.length > 0 || documentFiles.length > 0)
    }, [documentFiles.length, logoFile, photoFiles.length, uploadSession?.totalCount])

    const handlePickLogo = async () => {
        setApiError(null)
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            allowsMultipleSelection: false,
        })
        if (result.canceled || !result.assets?.length) return
        const asset = result.assets[0]
        const file = {
            uri: asset.uri,
            name: asset.fileName || getNameFromUri(asset.uri, 'logo.jpg'),
            type: asset.mimeType || 'image/jpeg',
        }
        await dispatch(uploadSessionUploadFileThunk({ kind: 'LOGO', file })).unwrap()
    }

    const handlePickPhotos = async () => {
        setApiError(null)
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: MAX_FILES,
        })
        if (result.canceled || !result.assets?.length) return
        const remainingSlots = Math.max(0, MAX_FILES - photoFiles.length)
        if (remainingSlots <= 0) return
        const assets = result.assets.slice(0, remainingSlots)
        for (const asset of assets) {
            const file = {
                uri: asset.uri,
                name: asset.fileName || asset.uri.split('/').pop() || 'photo.jpg',
                type: asset.mimeType || 'image/jpeg',
            }
            await dispatch(uploadSessionUploadFileThunk({ kind: 'PHOTO', file })).unwrap()
        }
    }

    const handlePickDocuments = async () => {
        setApiError(null)
        const result = await DocumentPicker.getDocumentAsync({
            multiple: true,
            type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
            copyToCacheDirectory: true,
        })
        if (result.canceled || !result.assets?.length) return
        const remainingSlots = Math.max(0, MAX_FILES - documentFiles.length)
        if (remainingSlots <= 0) return
        const assets = result.assets.slice(0, remainingSlots)
        for (const asset of assets) {
            const file = {
                uri: asset.uri,
                name: asset.name || asset.uri.split('/').pop() || 'document',
                type: asset.mimeType || 'application/pdf',
            }
            await dispatch(uploadSessionUploadFileThunk({ kind: 'DOCUMENT', file })).unwrap()
        }
    }

    const removeLogo = () => {
        if (logoFile) {
            dispatch(uploadSessionDeleteFileThunk(logoFile.id))
        }
    }

    const removePhoto = (index: number) => {
        const target = photoFiles[index]
        if (target) {
            dispatch(uploadSessionDeleteFileThunk(target.id))
        }
    }

    const clearPhotos = async () => {
        for (const file of photoFiles) {
            await dispatch(uploadSessionDeleteFileThunk(file.id))
        }
    }

    const removeDocument = (index: number) => {
        const target = documentFiles[index]
        if (target) {
            dispatch(uploadSessionDeleteFileThunk(target.id))
        }
    }

    const clearDocuments = async () => {
        for (const file of documentFiles) {
            await dispatch(uploadSessionDeleteFileThunk(file.id))
        }
    }

    const handleSkip = async () => {
        setApiError(null)
        try {
            await dispatch(submitBusinessFilesSkipThunk()).unwrap()
            router.replace('/(protected)/gate')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to skip'
            setApiError(message)
        }
    }

    const handleSubmit = async () => {
        setApiError(null)
        if (!hasAnyFile) {
            setError('Please upload at least one logo, photo or document, or skip for now.')
            return
        }
        setError(null)
        try {
            await dispatch(submitBusinessFilesThunk()).unwrap()
            router.replace('/(protected)/gate')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload files'
            setApiError(message)
        }
    }

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
                    <Pressable onPress={handleSkip} disabled={isLoading}>
                        <Text className="text-base font-semibold text-[#0C2A63]">Skip for now</Text>
                    </Pressable>
                </View>

                <View className="mb-4">
                    <Text className="text-base font-semibold text-[#111827]">Your Progress</Text>
                    <View className="mt-3 flex-row items-center gap-2">
                        <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                        <View className="h-1.5 flex-1 rounded-full bg-[#0C2A63]" />
                        <View className="h-1.5 flex-1 rounded-full bg-[#F59E0B]" />
                    </View>
                    <Text className="mt-2 text-sm font-medium text-[#0C2A63]">Step 3 of 3 · Branding</Text>
                </View>

                <View className="mb-6">
                    <Text className="text-center text-lg font-semibold text-[#0C2A63]">Your branding builds trust & increases booking chance</Text>
                </View>

                <UploadSection
                    title="Upload Logo"
                    required
                    description="File must be a JPEG, JPG, PNG or WEB and up to 5 MB"
                    icon="⬆"
                    onPress={handlePickLogo}
                />

                {logoFile ? (
                    <View className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="text-base font-semibold text-[#0C2A63]">Uploaded logo</Text>
                            <Pressable onPress={removeLogo}>
                                <Text className="text-base text-red-500">✕</Text>
                            </Pressable>
                        </View>
                        <View className="w-28 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                            <Image source={{ uri: logoFile.url }} className="h-16 w-16 rounded-md" resizeMode="cover" />
                            <Text className="mt-2 text-center text-xs text-[#111827]" numberOfLines={2}>
                                {logoFile.originalName || logoFile.url.split('/').pop()}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <UploadSection
                    title="Upload Business Photos"
                    required
                    description="File must be a JPEG, JPG, PNG or WEB and up to 10 MB per file"
                    icon="🖼"
                    onPress={handlePickPhotos}
                />

                {photoFiles.length > 0 ? (
                    <UploadedList
                        title={`Uploading ${photoFiles.length} files`}
                        files={photoFiles}
                        onRemove={removePhoto}
                        onClearAll={clearPhotos}
                        progress={photoFiles.length ? 100 : 0}
                        icon="🖼"
                        showPreview
                    />
                ) : null}

                <UploadSection
                    title="Upload Business Documents"
                    required
                    description="File must be a PDF, JPEG, JPG, PNG or WEB and up to 15 MB per file"
                    icon="📄"
                    onPress={handlePickDocuments}
                />

                {documentFiles.length > 0 ? (
                    <UploadedList
                        title={`Uploading ${documentFiles.length} files`}
                        files={documentFiles}
                        onRemove={removeDocument}
                        onClearAll={clearDocuments}
                        progress={documentFiles.length ? 100 : 0}
                        icon="📄"
                    />
                ) : null}

                {!!error && <Text className="mt-2 text-sm font-semibold text-red-600">{error}</Text>}
                {!!apiError && <Text className="mt-2 text-sm font-semibold text-red-600">{apiError}</Text>}

                <View className="mt-6">
                    <Pressable
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className={`w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${isLoading ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-base font-semibold text-white">Next</Text>
                    </Pressable>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

const UploadSection = ({ title, description, onPress, required, icon = '⬆' }: UploadSectionProps) => (
    <View className="mb-4">
        <Text className="text-sm font-semibold text-[#111827]">
            {title}
            {required ? '*' : ''}
        </Text>
        <Pressable
            onPress={onPress}
            className="mt-3 items-center justify-center rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6"
        >
            <Text className="text-3xl text-[#9CA3AF]">{icon}</Text>
            <Text className="mt-2 text-base font-semibold text-[#0C2A63]">Upload your {title.toLowerCase().replace('*', '')}</Text>
            <Text className="mt-1 text-center text-xs text-gray-500">{description}</Text>
        </Pressable>
    </View>
)

const UploadedList = ({ title, files, onRemove, onClearAll, progress = 100, icon = '📄', showPreview }: UploadedListProps) => (
    <View className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-[#0C2A63]">{title}</Text>
            {onClearAll ? (
                <Pressable onPress={onClearAll}>
                    <Text className="text-base text-red-500">✕</Text>
                </Pressable>
            ) : null}
        </View>
        <View className="flex-row flex-wrap gap-3">
            {files.map((file, idx) => (
                <View key={`${file.id}-${idx}`} className="w-[30%] items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                    <Pressable className="absolute right-1 top-1" onPress={() => onRemove(idx)}>
                        <Text className="text-xs text-red-500">✕</Text>
                    </Pressable>
                    {showPreview && file.mimeType?.startsWith('image') ? (
                        <Image source={{ uri: file.url }} className="mb-2 h-12 w-12 rounded-md" resizeMode="cover" />
                    ) : (
                        <Text className="text-2xl">{icon}</Text>
                    )}
                    <Text className="mt-2 text-center text-xs text-[#111827]" numberOfLines={2}>
                        {file.originalName || file.url.split('/').pop()}
                    </Text>
                </View>
            ))}
        </View>
        <View className="mt-3 h-1.5 w-full rounded-full bg-gray-200">
            <View className="h-1.5 rounded-full bg-[#0C2A63]" style={{ width: `${progress || 0}%` }} />
        </View>
        <Text className="mt-2 text-xs text-gray-500">Progress: {progress || 0}%</Text>
    </View>
)

export default BrandingScreen
