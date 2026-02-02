import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

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
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { AppText } from '@/components/ui/AppText'
import { Avatar } from '@/components/ui/Avatar'

type UploadSectionProps = {
    fieldTitle: string
    title: string
    description?: string
    onPress: () => void
    icon?: ReactNode
}

type UploadedListProps = {
    title: string
    files: UploadSessionFileDto[]
    onRemove: (index: number) => void
    onClearAll?: () => void
    progress?: number
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

    const steps = ['Business Info', 'Address', 'Branding', 'Verification']
    const currentStep = 3

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: 130, paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
            >
                <View className="flex-row items-end justify-end">
                    <Pressable onPress={handleSkip} disabled={isLoading}>
                        <Text className="text-base font-semibold text-[#0C2A63]">Skip for now</Text>
                    </Pressable>
                </View>

                <View className="mb-2 gap-2">
                    <ProgressStepper steps={steps} currentStep={currentStep} showLabels showFooter />
                    <Text className="text-2xl font-bold text-[#0C2A63]">Your branding builds trust & increases booking chance</Text>
                    <Text className="text-sm text-gray-600">This information helps us personalize your experience and settings.</Text>
                </View>

                <UploadSection
                    fieldTitle="Upload Logo"
                    title={'Upload your logo'}
                    description="File must be a JPEG, JPG, PNG or WEB and up to 5 MB"
                    icon={<Feather name="upload" size={35} color="#3a3a3a" />}
                    onPress={handlePickLogo}
                />
                {logoFile ? (
                    <View className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className={'mb-2 leading-[21px] font-poppins-semibold'}>Uploaded logo</AppText>
                            <Pressable onPress={removeLogo}>
                                <Text className="text-base text-red-500">✕</Text>
                            </Pressable>
                        </View>
                        <View className="w-28 mx-auto items-center justify-center gap-2 ">
                            <Avatar uri={logoFile.url} />
                            <Text className="mt-2 text-center text-xs text-[#111827]" numberOfLines={2}>
                                {logoFile.originalName || logoFile.url.split('/').pop()}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <UploadSection
                    fieldTitle="Upload Business Photos"
                    title={'Upload photos of your business'}
                    description="File must be a JPEG, JPG, PNG or WEB and up to 10 MB per file"
                    icon={<FontAwesome name="photo" size={35} color="#3a3a3a" />}
                    onPress={handlePickPhotos}
                />

                {photoFiles.length > 0 ? (
                    <UploadedList
                        title={`Uploading ${photoFiles.length} files`}
                        files={photoFiles}
                        onRemove={removePhoto}
                        onClearAll={clearPhotos}
                        progress={photoFiles.length ? 100 : 0}
                        showPreview
                    />
                ) : null}

                <UploadSection
                    fieldTitle="Upload Business Documents"
                    title={'Upload document of your business'}
                    icon={<Feather name="file" size={35} color="#3a3a3a" />}
                    onPress={handlePickDocuments}
                />

                {documentFiles.length > 0 ? (
                    <UploadedList
                        title={`Uploading ${documentFiles.length} files`}
                        files={documentFiles}
                        onRemove={removeDocument}
                        onClearAll={clearDocuments}
                        progress={documentFiles.length ? 100 : 0}
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

const UploadSection = ({ fieldTitle, title, description, onPress, icon = '⬆' }: UploadSectionProps) => (
    <View className="mb-4">
        <AppText>{fieldTitle}</AppText>
        <Pressable onPress={onPress} className="mt-3 items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-border pх-6 py-8">
            <View>{icon}</View>
            <AppText className={'mt-3'}>{title}</AppText>
            <AppText className={'mt-3 text-text-muted text-xs'}>{description}</AppText>
        </Pressable>
    </View>
)

const getFileExtension = (name?: string | null): string | null => {
    if (!name) return null
    const parts = name.split('.')
    return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? null) : null
}

export const getFileIcon = (file: UploadSessionFileDto): ReactNode => {
    const ext = getFileExtension(file.originalName)
    const mime = file.mimeType ?? ''

    // ---- Images ----
    if (mime.startsWith('image/')) {
        return <FontAwesome name="photo" size={28} color="#3a3a3a" />
    }

    // ---- PDF ----
    if (mime === 'application/pdf' || ext === 'pdf') {
        return <AntDesign name="file-pdf" size={28} color="#EF4444" />
    }

    // ---- Word ----
    if (mime.includes('word') || ext === 'doc' || ext === 'docx') {
        return <MaterialCommunityIcons name="file-word-box-outline" size={28} color="#2563EB" />
    }

    // ---- Excel ----
    if (mime.includes('excel') || ext === 'xls' || ext === 'xlsx') {
        return <MaterialCommunityIcons name="file-excel-box-outline" size={28} color="#16A34A" />
    }

    // ---- Text / Web ----
    if (mime.startsWith('text/') || ext === 'html' || ext === 'htm' || ext === 'txt') {
        return <Ionicons name="document-text-outline" size={28} color="#6B7280" />
    }

    // ---- Archives ----
    if (ext === 'zip' || ext === 'rar' || ext === '7z') {
        return <MaterialCommunityIcons name="archive-outline" size={28} color="#CA8A04" />
    }

    // ---- Fallback ----
    return <Feather name="file" size={28} color="#3a3a3a" />
}

const UploadedList = ({ title, files, onRemove, onClearAll, progress = 100, showPreview }: UploadedListProps) => (
    <View className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        {/* Header */}
        <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-[#0C2A63]">{title}</Text>

            {onClearAll && (
                <Pressable onPress={onClearAll} hitSlop={8}>
                    <Feather name="x" size={18} color="#EF4444" />
                </Pressable>
            )}
        </View>

        {/* Files */}
        <View className="flex-row flex-wrap gap-3">
            {files.map((file, idx) => {
                const isImage = file.mimeType?.startsWith('image')

                return (
                    <View key={file.id} className="relative w-[30%] items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                        {/* Remove */}
                        <Pressable className="absolute right-1 top-1 z-10" onPress={() => onRemove(idx)} hitSlop={8}>
                            <Feather name="x-circle" size={16} color="#EF4444" />
                        </Pressable>

                        {/* Preview / Icon */}
                        {showPreview && isImage ? (
                            <Image source={{ uri: file.url }} className="mb-2 h-12 w-12 rounded-md" resizeMode="cover" />
                        ) : (
                            <View className="mb-2 h-12 w-12 items-center justify-center">{getFileIcon(file)}</View>
                        )}

                        {/* Filename */}
                        <Text className="mt-1 text-center text-xs text-[#111827]" numberOfLines={2}>
                            {file.originalName ?? file.url.split('/').pop()}
                        </Text>
                    </View>
                )
            })}
        </View>

        {/* Progress */}
        <View className="mt-4 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
            <View className="h-1.5 rounded-full bg-[#0C2A63]" style={{ width: `${progress}%` }} />
        </View>

        <Text className="mt-2 text-xs text-gray-500">Progress: {progress}%</Text>
    </View>
)

export default BrandingScreen
