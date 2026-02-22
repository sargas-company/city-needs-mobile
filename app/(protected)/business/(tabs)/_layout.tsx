import type React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import Feather from '@expo/vector-icons/Feather'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

const IS_IOS_26_PLUS = Platform.OS === 'ios' && Number(Platform.Version) >= 26

function TabIcon({ icon, color }: { icon: React.ComponentProps<typeof Feather>['name']; color: string }) {
    return (
        <View style={styles.iconWrap}>
            <Feather name={icon} size={28} color={color} />
        </View>
    )
}

function NativeTabsLayout() {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    return (
        <NativeTabs
            backgroundColor={colors.background}
            iconColor={{
                default: colors.tabIconDefault,
                selected: colors.tabIconSelected,
            }}
            labelStyle={{
                color: colors.tabIconDefault,
                fontSize: 12,
            }}
        >
            <NativeTabs.Trigger
                name="index"
                options={{
                    title: 'Dashboard',
                    icon: { sf: 'square.grid.2x2' },
                    selectedIcon: { sf: 'square.grid.2x2.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="profile"
                options={{
                    title: 'Profile',
                    icon: { sf: 'person' },
                    selectedIcon: { sf: 'person.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="reels"
                options={{
                    title: 'Reels',
                    icon: { sf: 'play.rectangle' },
                    selectedIcon: { sf: 'play.rectangle.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="analytics"
                options={{
                    title: 'Analytics',
                    icon: { sf: 'chart.bar' },
                    selectedIcon: { sf: 'chart.bar.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="subscription"
                options={{
                    title: 'Subscription',
                    icon: { sf: 'star' },
                    selectedIcon: { sf: 'star.fill' },
                }}
            />
        </NativeTabs>
    )
}

function ClassicTabsLayout() {
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
                    paddingBottom: 24,
                    paddingHorizontal: 24,

                    backgroundColor: '#efefef',
                    borderTopWidth: 0,

                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,

                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    elevation: 0,
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
    )
}

export default function BusinessTabsLayout() {
    return IS_IOS_26_PLUS ? <NativeTabsLayout /> : <ClassicTabsLayout />
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 64,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
