import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function TestTabsLayout() {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    return (
        <Tabs
            initialRouteName="test-gamma"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 85,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'Poppins-Medium',
                },
                freezeOnBlur: false,
                lazy: false,
            }}
            detachInactiveScreens={false}
        >
            {/* ══════════ TEST TABS ══════════ */}
            <Tabs.Screen
                name="test-alpha"
                options={{
                    title: 'Alpha',
                    tabBarIcon: ({ color }) => <Feather name="circle" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="test-beta"
                options={{
                    title: 'Beta',
                    tabBarIcon: ({ color }) => <Feather name="square" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="test-gamma"
                options={{
                    title: 'Gamma',
                    tabBarIcon: ({ color }) => <Feather name="triangle" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="test-delta"
                options={{
                    title: 'Delta',
                    tabBarIcon: ({ color }) => <Feather name="hexagon" size={24} color={color} />,
                }}
            />

            {/* ══════════ HIDDEN ORIGINAL TABS ══════════ */}
            <Tabs.Screen name="index" options={{ href: null }} />
            <Tabs.Screen name="map" options={{ href: null }} />
            <Tabs.Screen name="search" options={{ href: null }} />
            <Tabs.Screen name="reels" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
        </Tabs>
    )
}
