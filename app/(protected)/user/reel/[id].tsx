import React, { useCallback, useRef, useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Video, ResizeMode } from 'expo-av'
import Feather from '@expo/vector-icons/Feather'

import { AppPressable } from '@/components/ui/AppPressable'

export default function ReelPlayerScreen() {
    const { id: _id, videoUrl } = useLocalSearchParams<{ id: string; videoUrl: string }>()
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const videoRef = useRef<Video>(null)
    const [showControls, setShowControls] = useState(true)

    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    const toggleControls = useCallback(() => {
        setShowControls((prev) => !prev)
    }, [])

    return (
        <View className="flex-1 bg-black">
            <AppPressable onPress={toggleControls} className="flex-1">
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl ?? '' }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    useNativeControls
                    style={{ flex: 1 }}
                />
            </AppPressable>

            {/* ── Back button ────────────────────────────── */}
            {showControls && (
                <View className="absolute left-4" style={{ top: insets.top + 8 }}>
                    <AppPressable
                        onPress={handleBack}
                        className="items-center justify-center rounded-full bg-black/50"
                        style={{ width: 40, height: 40 }}
                    >
                        <Feather name="arrow-left" size={22} color="#fff" />
                    </AppPressable>
                </View>
            )}
        </View>
    )
}
