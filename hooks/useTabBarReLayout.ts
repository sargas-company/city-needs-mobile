import { useEffect, useRef, useState } from 'react'
import { AppState, Platform } from 'react-native'

/**
 * iOS 26 bug: absolute-positioned tab bar loses touch responsiveness after
 * app resume. Toggling a tiny style property forces UIKit to recalculate
 * the hit-test region. Returns an extra bottom-margin value (0 or 0.1)
 * that should be spread into tabBarStyle.
 */
export function useTabBarReLayout() {
    const [nudge, setNudge] = useState(0)
    const appState = useRef(AppState.currentState)

    useEffect(() => {
        if (Platform.OS !== 'ios') return

        const sub = AppState.addEventListener('change', (next) => {
            if (appState.current.match(/inactive|background/) && next === 'active') {
                setNudge((n) => (n === 0 ? 0.1 : 0))
            }
            appState.current = next
        })

        return () => sub.remove()
    }, [])

    return { marginBottom: nudge }
}
