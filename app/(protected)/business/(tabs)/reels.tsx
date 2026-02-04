import React from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import * as ImagePicker from 'expo-image-picker'

import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useGetMyReelQuery, useUpsertMyReelMutation, useDeleteMyReelMutation } from '@/store/features/reels/reelsApi'

export default function BusinessReelsScreen() {
    const { data, isLoading, error, refetch } = useGetMyReelQuery()
    const [upsertReel, { isLoading: isUploading }] = useUpsertMyReelMutation()
    const [deleteReel, { isLoading: isDeleting }] = useDeleteMyReelMutation()

    const reel = data?.data?.reel ?? null
    const isBusy = isUploading || isDeleting

    const handlePickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: false,
            quality: 0.8,
        })
        if (result.canceled || !result.assets?.length) return

        const asset = result.assets[0]
        try {
            await upsertReel({
                uri: asset.uri,
                name: asset.fileName ?? 'reel.mp4',
                type: asset.mimeType ?? 'video/mp4',
            }).unwrap()
        } catch {
            Alert.alert('Error', 'Failed to upload reel. Please try again.')
        }
    }

    const handleDelete = () => {
        Alert.alert('Delete reel', 'Are you sure you want to delete your reel?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteReel().unwrap()
                    } catch {
                        Alert.alert('Error', 'Failed to delete reel.')
                    }
                },
            },
        ])
    }

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator />
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
                <Feather name="alert-circle" size={40} color="#8E94A3" />
                <AppText className="mt-4 text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load reel</AppText>
                <AppButton title="Retry" onPress={refetch} className="mt-4 w-full" variant="outline" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_CONTENT_OFFSET, paddingHorizontal: 24, paddingBottom: 140, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">My Reel</AppText>
                <AppText className="mt-1 text-[13px] font-poppins text-[#8E94A3]">Upload a short video to showcase your business</AppText>

                {reel ? (
                    <View className="mt-6">
                        <View className="aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0C2A63]">
                            <Feather name="play-circle" size={48} color="rgba(255,255,255,0.7)" />
                            <AppText className="mt-2 text-[13px] font-poppins-medium text-white/70">Video uploaded</AppText>
                        </View>

                        <AppText className="mt-3 text-[12px] font-poppins text-[#8E94A3]">
                            Uploaded {new Date(reel.createdAt).toLocaleDateString()}
                        </AppText>

                        <View className="mt-6 gap-3">
                            <AppButton
                                title="Replace video"
                                onPress={handlePickVideo}
                                loading={isUploading}
                                disabled={isBusy}
                                leftIcon={<Feather name="upload" size={18} color="#ffffff" />}
                            />
                            <AppButton
                                title="Delete reel"
                                onPress={handleDelete}
                                variant="outline"
                                loading={isDeleting}
                                disabled={isBusy}
                                leftIcon={<Feather name="trash-2" size={18} color="#0C2A63" />}
                            />
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <View className="h-36 w-36 items-center justify-center rounded-2xl bg-[#EAF0FF]">
                            <Feather name="video" size={40} color="#0C2A63" />
                        </View>

                        <AppText className="mt-6 text-center text-[22px] font-poppins-semibold text-[#0C2A63]">No reel yet</AppText>
                        <AppText className="mt-2 max-w-[260px] text-center text-[14px] font-poppins text-[#8E94A3]">
                            Upload a short video to attract more customers
                        </AppText>

                        <Pressable
                            onPress={handlePickVideo}
                            disabled={isBusy}
                            className="mt-8 w-full items-center justify-center rounded-2xl border border-dashed border-[#C9CEDA] py-6"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                            {isUploading ? (
                                <ActivityIndicator />
                            ) : (
                                <View className="items-center gap-2">
                                    <Feather name="upload" size={24} color="#0C2A63" />
                                    <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">Upload video</AppText>
                                    <AppText className="text-[12px] font-poppins text-[#8E94A3]">MP4 or MOV, max 30MB</AppText>
                                </View>
                            )}
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
