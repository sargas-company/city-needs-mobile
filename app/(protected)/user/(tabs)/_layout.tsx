import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function ProtectedTabsLayout() {
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
