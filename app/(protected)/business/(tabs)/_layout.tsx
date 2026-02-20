import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
// useTabBarReLayout removed — the marginBottom nudge is a workaround, not a fix.
// The real fix is to NOT use position: 'absolute' on the tab bar.

function TabIcon({
    icon,

    color,
}: {
    icon: React.ComponentProps<typeof Feather>['name']

    color: string
}) {
    return (
        <View style={styles.iconWrap} pointerEvents="none">
            <Feather name={icon} size={28} color={color} />
        </View>
    )
}

// Match user tabs layout constants
const TAB_BASE_HEIGHT = 72
const TAB_TOP_PADDING = 12
const TAB_SIDE_PADDING = 24
const BUMP_SIZE = 74
const DOT_SIZE = 14
export default function BusinessTabsLayout() {
    const colorScheme = useColorScheme()
    const active = Colors[colorScheme ?? 'light'].tint
    const insets = useSafeAreaInsets()

    const tabBarHeight = useMemo(() => {
        const bottomPad = Math.max(insets.bottom, 16)
        return TAB_BASE_HEIGHT + bottomPad
    }, [insets.bottom])

    return (
        <View style={styles.root}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarButton: HapticTab,

                    tabBarActiveTintColor: active,
                    tabBarInactiveTintColor: '#C9C9C9',

                    // FIX: Removed position: 'absolute', zIndex, elevation
                    // These cause iOS hit-testing issues after app resume (iOS 26+ bug)
                    // See: useTabBarReLayout.ts for documentation of the bug
                    tabBarStyle: {
                        height: tabBarHeight,
                        paddingTop: TAB_TOP_PADDING,
                        paddingBottom: Math.max(insets.bottom, 16),
                        paddingHorizontal: TAB_SIDE_PADDING,

                        backgroundColor: '#efefef',
                        borderTopWidth: 0,

                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,

                        // NOT using position: 'absolute' — fixes touch responsiveness after app resume
                    },

                    tabBarLabelStyle: {
                        fontSize: 12,
                        marginTop: 4,
                    },

                    tabBarItemStyle: {
                        paddingVertical: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color }) => <TabIcon icon="grid" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <TabIcon icon="user" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="reels"
                    options={{
                        title: 'Reels',
                        tabBarIcon: ({ color }) => <TabIcon icon="play" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarIcon: ({ color }) => <TabIcon icon="bar-chart-2" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="subscription"
                    options={{
                        title: 'Subscription',
                        tabBarIcon: ({ color }) => <TabIcon icon="star" color={color} />,
                    }}
                />
            </Tabs>
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

    bump: {
        position: 'absolute',
        top: -BUMP_SIZE / 2,
        width: BUMP_SIZE,
        height: BUMP_SIZE,
        borderRadius: BUMP_SIZE / 2,
        backgroundColor: '#0B1A4B',
    },

    dot: {
        position: 'absolute',
        top: -6,
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: '#2F55FF',
    },
})
