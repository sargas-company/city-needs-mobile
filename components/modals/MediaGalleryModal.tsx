import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, useWindowDimensions, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { useVideoPlayer, VideoView } from 'expo-video'
import PagerView from 'react-native-pager-view'

import { AppText } from '@/components/ui/AppText'

type MediaItem = { type: 'video'; url: string; thumbnailUrl?: string } | { type: 'photo'; url: string; id: string }

type MediaGalleryModalProps = {
    visible: boolean
    onClose: () => void
    items: MediaItem[]
    initialIndex?: number
}

/** Placeholder shown for video slides that are not close to current index */
const VideoPlaceholder = ({ thumbnailUrl, screenWidth, screenHeight }: { thumbnailUrl?: string; screenWidth: number; screenHeight: number }) => {
    return (
        <View className="flex-1 items-center justify-center">
            {thumbnailUrl ? (
                <Image
                    source={{ uri: thumbnailUrl }}
                    style={{ width: screenWidth, height: screenHeight * 0.7 }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                />
            ) : (
                <View style={{ width: screenWidth, height: screenHeight * 0.7 }} className="items-center justify-center bg-neutral-900">
                    <Feather name="play-circle" size={64} color="#666" />
                </View>
            )}
        </View>
    )
}

const VideoSlide = ({ url, isActive, screenWidth, screenHeight }: { url: string; isActive: boolean; screenWidth: number; screenHeight: number }) => {
    const player = useVideoPlayer(url, (p) => {
        p.loop = false
    })

    useEffect(() => {
        if (isActive) {
            player.play()
        } else {
            player.pause()
        }
    }, [isActive, player])

    useEffect(() => {
        return () => {
            try {
                player.pause()
            } catch {
                // Player already released by expo-video
            }
        }
    }, [player])

    return (
        <View className="flex-1 items-center justify-center">
            <VideoView
                player={player}
                style={{ width: screenWidth, height: screenHeight * 0.7 }}
                contentFit="contain"
                nativeControls
                allowsFullscreen
            />
        </View>
    )
}

const PhotoSlide = ({ url, screenWidth, screenHeight }: { url: string; screenWidth: number; screenHeight: number }) => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <View className="flex-1 items-center justify-center">
            {isLoading && <ActivityIndicator size="large" color="#FFFFFF" className="absolute" />}
            <Image
                source={{ uri: url }}
                style={{ width: screenWidth, height: screenHeight * 0.7 }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
                onLoad={() => setIsLoading(false)}
            />
        </View>
    )
}

export const MediaGalleryModal = ({ visible, onClose, items, initialIndex = 0 }: MediaGalleryModalProps) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions()
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const pagerRef = useRef<PagerView>(null)

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex)
            setTimeout(() => {
                pagerRef.current?.setPage(initialIndex)
            }, 0)
        }
    }, [visible, initialIndex])

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
                    <Pressable
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Close gallery"
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                    >
                        <Feather name="x" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                <PagerView ref={pagerRef} style={{ flex: 1 }} initialPage={initialIndex} onPageSelected={handlePageSelected} overdrag>
                    {items.map((item, index) => {
                        // Only render video players for slides within ±1 of current to save memory
                        const isNearCurrent = Math.abs(index - currentIndex) <= 1

                        return (
                            <View key={item.type === 'video' ? `video-${index}` : item.id} className="flex-1">
                                {item.type === 'video' ? (
                                    isNearCurrent ? (
                                        <VideoSlide
                                            url={item.url}
                                            isActive={currentIndex === index}
                                            screenWidth={screenWidth}
                                            screenHeight={screenHeight}
                                        />
                                    ) : (
                                        <VideoPlaceholder thumbnailUrl={item.thumbnailUrl} screenWidth={screenWidth} screenHeight={screenHeight} />
                                    )
                                ) : (
                                    <PhotoSlide url={item.url} screenWidth={screenWidth} screenHeight={screenHeight} />
                                )}
                            </View>
                        )
                    })}
                </PagerView>
            </View>
        </Modal>
    )
}
