import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

function TabIcon({
    icon,
    focused,
    color,
    showBump = true,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    focused: boolean
    color: string
    showBump?: boolean
}) {
    return (
        <View style={styles.iconWrap}>
            {/*{focused && showBump && <View style={styles.bump} />}*/}
            {/*{focused && <View style={styles.dot} />}*/}
            <Feather name={icon} size={28} color={color} />
        </View>
    )
}

export default function ProtectedTabsLayout() {
    const colorScheme = useColorScheme()
    const active = Colors[colorScheme ?? 'light'].tint

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,

                tabBarActiveTintColor: active,
                tabBarInactiveTintColor: '#C9C9C9',

                tabBarStyle: {
                    height: 'auto',
                    paddingTop: 10,
                    paddingBottom: 14,
                    paddingHorizontal: 24,

                    backgroundColor: '#efefef',
                    borderTopWidth: 0,

                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,

                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 10,
                    elevation: 0,
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
                    tabBarIcon: ({ focused, color }) => <TabIcon icon="home" focused={focused} color={color} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ focused, color }) => <TabIcon icon="map-pin" focused={focused} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ focused, color }) => <TabIcon icon="search" focused={focused} color={color} />,
                }}
            />

            <Tabs.Screen
                name="reels"
                options={{
                    title: 'Reels',
                    tabBarIcon: ({ focused, color }) => <TabIcon icon="video" focused={focused} color={color} />,
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => <TabIcon icon="user" focused={focused} color={color} />,
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
