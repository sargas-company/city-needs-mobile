import React, { useState } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import * as VideoThumbnails from 'expo-video-thumbnails'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useUpsertMyReelMutation } from '@/store/features/reels/reelsApi'

type PickedVideo = {
    uri: string
    name: string
    type: string
    thumbnailUri: string | null
}

const UploadReelScreen = () => {
    const router = useRouter()
    const [upsertReel, { isLoading }] = useUpsertMyReelMutation()
    const [pickedVideo, setPickedVideo] = useState<PickedVideo | null>(null)

    const handlePickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: false,
            quality: 0.8,
        })
        if (result.canceled || !result.assets?.length) return

        const asset = result.assets[0]

        let thumbnailUri: string | null = null
        try {
            const thumbnail = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 0 })
            thumbnailUri = thumbnail.uri
        } catch {
            // Fallback to no thumbnail if generation fails
        }

        setPickedVideo({
            uri: asset.uri,
            name: asset.fileName ?? 'reel.mp4',
            type: asset.mimeType ?? 'video/mp4',
            thumbnailUri,
        })
    }

    const handleUpload = async () => {
        if (!pickedVideo) return
        try {
            await upsertReel(pickedVideo).unwrap()
            router.back()
        } catch {
            Alert.alert('Error', 'Failed to upload reel. Please try again.')
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1 px-6">
                <View className="relative items-center justify-center pt-6 pb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-0 h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>

                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">Upload Reel</AppText>
                </View>

                <View className="mt-6 flex-1">
                    {pickedVideo ? (
                        <View className="items-center">
                            {pickedVideo.thumbnailUri ? (
                                <Image
                                    source={{ uri: pickedVideo.thumbnailUri }}
                                    style={{ width: 120, height: 213, borderRadius: 12 }}
                                    contentFit="cover"
                                />
                            ) : (
                                <View className="items-center justify-center rounded-xl bg-[#0C2A63]" style={{ width: 120, height: 213 }}>
                                    <Feather name="film" size={32} color="rgba(255,255,255,0.7)" />
                                </View>
                            )}

                            <AppText className="mt-3 text-center text-[13px] font-poppins text-[#8E94A3]">{pickedVideo.name}</AppText>

                            <Pressable onPress={handlePickVideo} className="mt-2" hitSlop={8}>
                                <AppText className="font-poppins-medium text-[13px] text-[#3B82F6]">Choose different video</AppText>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={handlePickVideo}
                            className="h-48 w-full items-center justify-center rounded-2xl border border-dashed border-[#C9CEDA]"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                            <Feather name="upload" size={28} color="#0C2A63" />
                            <AppText className="mt-2 font-poppins-semibold text-[15px] text-[#0C2A63]">Choose video</AppText>
                            <AppText className="mt-1 text-[12px] font-poppins text-[#8E94A3]">MP4 or MOV, max 30MB</AppText>
                        </Pressable>
                    )}
                </View>

                <View className="pb-8">
                    <AppButton
                        title="Upload"
                        onPress={handleUpload}
                        loading={isLoading}
                        disabled={!pickedVideo || isLoading}
                        leftIcon={<Feather name="upload" size={18} color="#ffffff" />}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default UploadReelScreen
