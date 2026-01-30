import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BOTTOM_SHEET_DEFAULTS } from '@/constants/bottom-sheet'

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
    radiusTop = BOTTOM_SHEET_DEFAULTS.radiusTop,
}: Props) => {
    const modalRef = useRef<Modalize>(null)
    const insets = useSafeAreaInsets()

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.open()
        } else {
            modalRef.current?.close()
        }
    }, [isOpen])

    return (
        <Modalize
            ref={modalRef}
            withReactModal
            withHandle={withHandle}
            adjustToContentHeight={sheetHeight ? false : adjustToContentHeight}
            modalHeight={sheetHeight}
            panGestureEnabled={panGestureEnabled}
            closeOnOverlayTap={closeOnOverlayTap}
            onClosed={onClose}
            openAnimationConfig={BOTTOM_SHEET_DEFAULTS.openAnimationConfig}
            closeAnimationConfig={BOTTOM_SHEET_DEFAULTS.closeAnimationConfig}
            handleStyle={{ backgroundColor: '#E0E0E0', width: 40, height: 4 }}
            handlePosition="inside"
            overlayStyle={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
            modalStyle={{
                borderTopLeftRadius: radiusTop,
                borderTopRightRadius: radiusTop,
                overflow: 'hidden',
            }}
        >
            <View style={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}>{children}</View>
        </Modalize>
    )
}
