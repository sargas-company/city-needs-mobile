import React, { useCallback } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { useGetMyReelQuery, useDeleteMyReelMutation } from '@/store/features/reels/reelsApi'
import type { MyReel } from '@/store/features/reels/reels.types'

export default function BusinessReelsScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { data, isLoading, isFetching, error, refetch } = useGetMyReelQuery()
    const [deleteReel] = useDeleteMyReelMutation()

    // @ts-ignore
    const reel = data?.reel ?? null

    const handleDelete = useCallback(
        (item: MyReel) => {
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
        },
        [deleteReel]
    )

    const renderReelCard = (item: MyReel) => (
        <View key={item.id} className="flex-row items-center rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#EAF0FF]">
                <Feather name="film" size={20} color="#0C2A63" />
            </View>

            <View className="flex-1">
                <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">Business Reel</AppText>
                <AppText className="mt-0.5 font-poppins text-[12px] text-[#8E94A3]">{new Date(item.createdAt).toLocaleDateString()}</AppText>
            </View>

            <Pressable onPress={() => handleDelete(item)} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                <Feather name="trash-2" size={20} color="#0C2A63" />
            </Pressable>
        </View>
    )

    const renderAddButton = () => (
        <Pressable
            onPress={() => router.push('/(protected)/business/reel/upload' as never)}
            className="mt-4 items-center justify-center rounded-2xl border border-dashed border-[#C9CEDA] py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
            <View className="flex-row items-center gap-2">
                <Feather name="plus" size={18} color="#0C2A63" />
                <AppText className="font-poppins-semibold text-[15px] text-[#0C2A63]">{reel ? 'Replace reel' : 'Add reel'}</AppText>
            </View>
        </Pressable>
    )

    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center px-6">
            <View className="h-36 w-36 items-center justify-center rounded-2xl bg-[#EAF0FF]">
                <Feather name="video" size={40} color="#0C2A63" />
            </View>
            <AppText className="mt-6 text-center text-[22px] font-poppins-semibold text-[#0C2A63]">No reel yet</AppText>
            <AppText className="mt-2 max-w-[260px] text-center text-[14px] font-poppins text-[#8E94A3]">
                Upload a short video to attract more customers
            </AppText>
        </View>
    )

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="flex-1">
                <View className="items-center justify-center px-6 pt-6 pb-4">
                    <AppText className="text-[18px] font-poppins-semibold text-[#0C2A63]">My Reels</AppText>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load reels</AppText>
                    </View>
                ) : !reel ? (
                    <View className="flex-1">
                        {renderEmpty()}
                        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
                            {renderAddButton()}
                        </View>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 120 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                    >
                        {renderReelCard(reel)}
                        {renderAddButton()}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    )
}
