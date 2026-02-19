import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

function TabIcon({ icon, color }: { icon: React.ComponentProps<typeof Feather>['name']; color: string }) {
    return (
        <View style={styles.iconWrap}>
            <Feather name={icon} size={28} color={color} />
        </View>
    )
}

export default function ProtectedTabsLayout() {
    const colorScheme = useColorScheme()
    const active = Colors[colorScheme ?? 'light'].tint
    const insets = useSafeAreaInsets()

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                lazy: true,

                tabBarActiveTintColor: active,
                tabBarInactiveTintColor: '#C9C9C9',

                tabBarStyle: {
                    paddingTop: 10,
                    paddingBottom: Math.max(insets.bottom, 16),
                    paddingHorizontal: 24,

                    backgroundColor: '#efefef',
                    borderTopWidth: 0,

                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,

                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                    zIndex: 10,
                    elevation: 10,
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
                    title: 'Home',
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
    )
}

const BUMP_SIZE = 74
const DOT_SIZE = 14

const styles = StyleSheet.create({
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
