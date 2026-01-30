import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Modal, PanResponder, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BOTTOM_SHEET_DEFAULTS } from '@/constants/bottom-sheet'

const SCREEN_HEIGHT = Dimensions.get('window').height
const DISMISS_THRESHOLD = 120

type Props = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    sheetHeight?: number
    adjustToContentHeight?: boolean
    closeOnOverlayTap?: boolean
    panGestureEnabled?: boolean
    withHandle?: boolean
    overlayOpacity?: number
    overlayColor?: string
    radiusTop?: number
}

export const AppBottomSheet = ({
    isOpen,
    onClose,
    children,
    sheetHeight,
    adjustToContentHeight = true,
    closeOnOverlayTap = BOTTOM_SHEET_DEFAULTS.closeOnOverlayTap,
    panGestureEnabled = BOTTOM_SHEET_DEFAULTS.panGestureEnabled,
    withHandle = BOTTOM_SHEET_DEFAULTS.withHandle,
    overlayOpacity = BOTTOM_SHEET_DEFAULTS.overlayOpacity,
    overlayColor = BOTTOM_SHEET_DEFAULTS.overlayColor,
    radiusTop = BOTTOM_SHEET_DEFAULTS.radiusTop,
}: Props) => {
    const insets = useSafeAreaInsets()
    const [modalVisible, setModalVisible] = useState(false)
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
    const overlayAnim = useRef(new Animated.Value(0)).current

    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, bounciness: 4, useNativeDriver: true }),
        ]).start()
    }, [overlayAnim, translateY])

    const animateOut = useCallback(
        (callback?: () => void) => {
            Animated.parallel([
                Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
            ]).start(() => {
                setModalVisible(false)
                callback?.()
            })
        },
        [overlayAnim, translateY]
    )

    useEffect(() => {
        if (isOpen) {
            translateY.setValue(SCREEN_HEIGHT)
            overlayAnim.setValue(0)
            setModalVisible(true)
        } else if (modalVisible) {
            animateOut()
        }
    }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = useCallback(() => {
        animateOut(onClose)
    }, [animateOut, onClose])

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => panGestureEnabled && gesture.dy > 8,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy)
                    const progress = Math.max(0, 1 - gesture.dy / SCREEN_HEIGHT)
                    overlayAnim.setValue(progress)
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > DISMISS_THRESHOLD || gesture.vy > 0.5) {
                    animateOut(onClose)
                } else {
                    Animated.parallel([
                        Animated.spring(translateY, { toValue: 0, bounciness: 4, useNativeDriver: true }),
                        Animated.timing(overlayAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                    ]).start()
                }
            },
        })
    ).current

    const heightStyle = sheetHeight && !adjustToContentHeight ? { height: sheetHeight } : undefined

    return (
        <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose} onShow={animateIn}>
            <View className="flex-1 justify-end">
                {/* Overlay */}
                <Animated.View
                    className="absolute inset-0"
                    style={{
                        backgroundColor: overlayColor,
                        opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, overlayOpacity] }),
                    }}
                >
                    <Pressable className="flex-1" onPress={closeOnOverlayTap ? handleClose : undefined} />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    style={[
                        {
                            backgroundColor: '#FFFFFF',
                            borderTopLeftRadius: radiusTop,
                            borderTopRightRadius: radiusTop,
                            paddingBottom: insets.bottom + 16,
                            transform: [{ translateY }],
                        },
                        heightStyle,
                    ]}
                    {...panResponder.panHandlers}
                >
                    {withHandle && (
                        <View className="items-center pt-3 pb-2">
                            <View className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
                        </View>
                    )}

                    {children}
                </Animated.View>
            </View>
        </Modal>
    )
}
