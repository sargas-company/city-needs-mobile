import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather'

import { openSettings } from '@/services/location/LocationService'
import { getLocationErrorMessage } from '@/services/location/locationErrors'
import { submitGpsLocation } from '@/services/location/submitLocation'
import { useSyncLocationMutation } from '@/store/api/locationApi'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { setProfileLocation } from '@/store/features/profile/profile.slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectLocationPermission } from '@/store/features/location/location.selectors'
import { AppButton } from '@/components/ui/AppButton'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const LocationGate = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>()
    const isFromProfile = fromProfile === 'true'
    const permission = useAppSelector(selectLocationPermission)
    const [error, setError] = useState<string | null>(null)
    const [syncLocation, syncLocationState] = useSyncLocationMutation()

    const handleAllow = async () => {
        setError(null)
        try {
            const result = await submitGpsLocation({
                onPermission: (status) => dispatch(setLocationPermission(status)),
                onStored: (payload) => dispatch(setLocation(payload)),
                sync: (payload) => syncLocation(payload).unwrap(),
            })

            if (!result.ok && result.reason === 'permission') {
                setError('Location permission is required to continue.')
                return
            }
            if (result.ok && result.response.ok && result.response.location) {
                dispatch(setLocation(result.response.location))
                dispatch(setProfileLocation(result.response.location))
            }
            if (isFromProfile) {
                router.back()
            } else {
                router.replace('/(protected)/gate')
            }
        } catch (err) {
            setError(getLocationErrorMessage(err, 'Failed to fetch location'))
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6 py-8" style={isFromProfile ? { paddingTop: HEADER_CONTENT_OFFSET } : undefined}>
            {isFromProfile && (
                <View className="mb-4 flex-row items-center gap-3">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                        accessibilityRole="button"
                    >
                        <Feather name="arrow-left" size={20} color="#0C2A63" />
                    </Pressable>
                </View>
            )}
            <View className="flex-1 items-center justify-center gap-6">
                <View className="h-32 w-32 items-center justify-center rounded-full bg-[#E9EEF9]">
                    <MaterialCommunityIcons name="map-marker" size={55} color="#0C2A63" />
                </View>
                <View className="items-center gap-2">
                    <Text className="text-xl font-semibold text-brand">What is Your Location?</Text>
                    <Text className="text-center text-base text-text-muted">To Find Nearby providers Availability.</Text>
                </View>

                {!!error && <Text className="text-sm font-semibold text-red-600">{error}</Text>}

                <AppButton
                    title={'Allow Location Access'}
                    onPress={handleAllow}
                    loading={syncLocationState.isLoading}
                    disabled={syncLocationState.isLoading}
                />

                <Pressable
                    onPress={() =>
                        router.push(
                            isFromProfile ? '/(protected)/(onboarding)/location-manual?fromProfile=true' : '/(protected)/(onboarding)/location-manual'
                        )
                    }
                >
                    <Text className="text-sm font-semibold text-brand">Enter Location Manually</Text>
                </Pressable>

                {permission === 'denied' ? (
                    <Pressable onPress={openSettings}>
                        <Text className="text-sm font-semibold text-brand">Open Settings</Text>
                    </Pressable>
                ) : null}
            </View>
        </SafeAreaView>
    )
}

export default LocationGate
