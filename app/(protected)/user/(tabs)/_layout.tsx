import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, Pressable, Platform } from 'react-native'
import { Tabs, usePathname } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
// import { useTabBarReLayout } from '@/hooks/useTabBarReLayout'

const DEBUG_TOUCH = true // <-- выключишь потом
const DEBUG_TOUCH_OVERLAY = false
const DEBUG_TAB_BUTTON = true
function TabIcon({ icon, color }: { icon: React.ComponentProps<typeof Feather>['name']; color: string }) {
    return (
        <View style={styles.iconWrap} pointerEvents="none">
            <Feather name={icon} size={28} color={color} />
        </View>
    )
}

const TAB_BASE_HEIGHT = 72
const TAB_TOP_PADDING = 12
const TAB_SIDE_PADDING = 24

export default function ProtectedTabsLayout() {
    const colorScheme = useColorScheme()
    const active = Colors[colorScheme ?? 'light'].tint
    const insets = useSafeAreaInsets()
    const pathname = usePathname()
    // const reLayout = useTabBarReLayout()

    const tabBarHeight = useMemo(() => {
        // bottom inset + минимальный комфортный padding
        const bottomPad = Math.max(insets.bottom, 16)
        return TAB_BASE_HEIGHT + bottomPad
    }, [insets.bottom])

    const onDebugOverlayPress = useCallback(() => {
        console.log('[TABBAR_DEBUG] overlay pressed', {
            pathname,
            bottomInset: insets.bottom,
            platform: Platform.OS,
            tabBarHeight,
        })
    }, [pathname, insets.bottom, tabBarHeight])

    // Обёртка над HapticTab для логирования нажатий на табы
    const DebugTabButton = useCallback((props: any) => {
        const { accessibilityState, routeName } = props ?? {}
        const isSelected = accessibilityState?.selected

        return (
            <HapticTab
                {...props}
                onPress={(e: any) => {
                    console.log('[TABBAR_DEBUG] tab pressed:', routeName, { isSelected })
                    props?.onPress?.(e)
                }}
            />
        )
    }, [])

    return (
        <View style={styles.root}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    lazy: true,

                    // Включай обычный HapticTab когда дебаг закончишь
                    tabBarButton: undefined,

                    tabBarActiveTintColor: active,
                    tabBarInactiveTintColor: '#C9C9C9',

                    // Ключевое: НЕ absolute
                    tabBarStyle: {
                        height: tabBarHeight,
                        paddingTop: TAB_TOP_PADDING,
                        paddingBottom: Math.max(insets.bottom, 16),
                        paddingHorizontal: TAB_SIDE_PADDING,

                        backgroundColor: '#efefef',
                        borderTopWidth: 0,

                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,

                        // Убираем absolute/zIndex/elevation — часто ломает hit-testing на новых iOS
                        // ...reLayout,
                    },

                    tabBarLabelStyle: {
                        fontSize: 16,
                        marginTop: 8,
                    },

                    tabBarItemStyle: {
                        paddingVertical: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Homes',
                        tabBarIcon: ({ color }) => <TabIcon icon="home" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        title: 'Map',
                        tabBarIcon: ({ color }) => <TabIcon icon="map-pin" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Search',
                        tabBarIcon: ({ color }) => <TabIcon icon="search" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="reels"
                    options={{
                        title: 'Reels',
                        tabBarIcon: ({ color }) => <TabIcon icon="video" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <TabIcon icon="user" color={color} />,
                    }}
                />
            </Tabs>

            {/* DEBUG overlay: поверх таббара. Если тапы не проходят — увидишь сразу */}
            {DEBUG_TOUCH_OVERLAY && (
                <Pressable onPress={onDebugOverlayPress} style={[styles.debugOverlay, { height: tabBarHeight }]}>
                    <View pointerEvents="none" style={styles.debugOverlayFill} />
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    iconWrap: {
        width: 64,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    debugOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(255,0,0,0.1)', // можно включить если хочешь визуально видеть
    },

    debugOverlayFill: {
        flex: 1,
        backgroundColor: 'rgba(255,0,0,0.10)',
    },
})
