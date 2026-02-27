import type React from 'react'
import { View, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import Feather from '@expo/vector-icons/Feather'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { IS_IOS_LIQUID_GLASS } from '@/utils/platform'

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
    const isDark = colorScheme === 'dark'

    return (
        <NativeTabs
            backgroundColor={colors.background}
            tintColor={colors.tabIconSelected}
            blurEffect={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
            iconColor={{
                default: colors.tabIconDefault,
                selected: colors.tabIconSelected,
            }}
            labelStyle={{
                default: {
                    color: colors.tabIconDefault,
                    fontSize: 12,
                    fontWeight: '600',
                    fontFamily: 'Poppins_600SemiBold',
                },
                selected: {
                    color: colors.tabIconSelected,
                    fontSize: 12,
                    fontWeight: '700',
                    fontFamily: 'Poppins_600SemiBold',
                },
            }}
        >
            <NativeTabs.Trigger
                name="index"
                options={{
                    title: 'Home',
                    icon: { sf: 'house' },
                    selectedIcon: { sf: 'house.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="map"
                options={{
                    title: 'Map',
                    icon: { sf: 'mappin' },
                    selectedIcon: { sf: 'mappin.circle.fill' },
                }}
            />
            <NativeTabs.Trigger
                name="search"
                options={{
                    title: 'Search',
                    icon: { sf: 'magnifyingglass' },
                    selectedIcon: { sf: 'magnifyingglass.circle.fill' },
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
                name="profile"
                options={{
                    title: 'Profile',
                    icon: { sf: 'person' },
                    selectedIcon: { sf: 'person.fill' },
                }}
            />
        </NativeTabs>
    )
}

function ClassicTabsLayout() {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,

                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,

                tabBarStyle: {
                    height: 'auto',
                    paddingTop: 10,
                    paddingBottom: 24,
                    paddingHorizontal: 24,

                    backgroundColor: colors.tabBarBackground,
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
                    fontSize: 16,
                    marginTop: 8,
                    fontFamily: 'Poppins_500Medium',
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

export default function ProtectedTabsLayout() {
    return IS_IOS_LIQUID_GLASS ? <NativeTabsLayout /> : <ClassicTabsLayout />
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 64,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
