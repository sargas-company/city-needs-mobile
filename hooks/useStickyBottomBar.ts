import { useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface StickyBottomBarOptions {
    minBottomPadding?: number
    barBaseHeight?: number
    extraContentGap?: number
}

interface StickyBottomBarResult {
    bottomPadding: number
    contentPaddingBottom: number
    bottomBarStyle: { paddingBottom: number; zIndex: number; elevation: number }
    keyboardBottomOffset: number
}

export function useStickyBottomBar(opts: StickyBottomBarOptions = {}): StickyBottomBarResult {
    const { minBottomPadding = 32, barBaseHeight = 88, extraContentGap = 12 } = opts
    const insets = useSafeAreaInsets()

    return useMemo(() => {
        const bottomPadding = Math.max(insets.bottom, minBottomPadding)
        return {
            bottomPadding,
            contentPaddingBottom: barBaseHeight + bottomPadding + extraContentGap,
            bottomBarStyle: { paddingBottom: bottomPadding, zIndex: 10, elevation: 10 },
            keyboardBottomOffset: bottomPadding,
        }
    }, [insets.bottom, minBottomPadding, barBaseHeight, extraContentGap])
}
