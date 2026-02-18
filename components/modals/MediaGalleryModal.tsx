import React, { useCallback, useState } from 'react'
import { Dimensions, Modal, Pressable, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { useVideoPlayer, VideoView } from 'expo-video'
import PagerView from 'react-native-pager-view'

import { AppText } from '@/components/ui/AppText'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type MediaItem = { type: 'video'; url: string; thumbnailUrl?: string } | { type: 'photo'; url: string; id: string }

type MediaGalleryModalProps = {
    visible: boolean
    onClose: () => void
    items: MediaItem[]
    initialIndex?: number
}

const VideoSlide = ({ url, isActive }: { url: string; isActive: boolean }) => {
    const player = useVideoPlayer(url, (p) => {
        p.loop = false
        if (isActive) {
            p.play()
        }
    })

    React.useEffect(() => {
        if (isActive) {
            player.play()
        } else {
            player.pause()
        }
    }, [isActive, player])

    return (
        <View className="flex-1 items-center justify-center">
            <VideoView
                player={player}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
                contentFit="contain"
                nativeControls
                allowsFullscreen
            />
        </View>
    )
}

const PhotoSlide = ({ url }: { url: string }) => {
    return (
        <View className="flex-1 items-center justify-center">
            <Image
                source={{ uri: url }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
            />
        </View>
    )
}

export const MediaGalleryModal = ({ visible, onClose, items, initialIndex = 0 }: MediaGalleryModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
        setCurrentIndex(e.nativeEvent.position)
    }, [])

    if (items.length === 0) return null

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black">
                <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-6">
                    <View className="rounded-full bg-black/50 px-3 py-1">
                        <AppText className="font-poppins-medium text-[14px] text-white">
                            {currentIndex + 1} / {items.length}
                        </AppText>
                    </View>
                    <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <Feather name="x" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                <PagerView style={{ flex: 1 }} initialPage={initialIndex} onPageSelected={handlePageSelected} overdrag>
                    {items.map((item, index) => (
                        <View key={item.type === 'video' ? 'video' : item.id} className="flex-1">
                            {item.type === 'video' ? <VideoSlide url={item.url} isActive={currentIndex === index} /> : <PhotoSlide url={item.url} />}
                        </View>
                    ))}
                </PagerView>
            </View>
        </Modal>
    )
}
