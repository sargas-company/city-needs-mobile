import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { getCurrentPosition, openSettings, requestLocationPermission, reverseGeocode } from '@/services/location/LocationService'
import { syncLocation } from '@/services/location/locationApi'
import { StoredLocation } from '@/services/location/location.types'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectLocationPermission } from '@/store/features/location/location.selectors'
import { AppButton } from '@/components/ui/AppButton'

const LocationGate = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const permission = useAppSelector(selectLocationPermission)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAllow = async () => {
        setError(null)
        setIsLoading(true)
        try {
            const status = await requestLocationPermission()
            dispatch(setLocationPermission(status))
            if (status !== 'granted') {
                setError('Location permission is required to continue.')
                return
            }

            const coords = await getCurrentPosition()
            const formattedAddress = await reverseGeocode(coords.lat, coords.lng)
            const payload: StoredLocation = {
                lat: coords.lat,
                lng: coords.lng,
                source: 'gps',
                formattedAddress,
                updatedAt: new Date().toISOString(),
            }
            dispatch(setLocation(payload))
            void syncLocation(payload).catch(() => undefined)
            router.replace('/(protected)/gate')
        } catch (err) {
            setError((err as Error)?.message ?? 'Failed to fetch location')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6 py-8">
            <View className="flex-1 items-center justify-center gap-6">
                <View className="h-32 w-32 items-center justify-center rounded-full bg-[#E9EEF9]">
                    <MaterialCommunityIcons name="map-marker" size={55} color="#0C2A63" />
                </View>
                <View className="items-center gap-2">
                    <Text className="text-xl font-semibold text-brand">What is Your Location?</Text>
                    <Text className="text-center text-base text-text-muted">To Find Nearby providers Availability.</Text>
                </View>

                {!!error && <Text className="text-sm font-semibold text-red-600">{error}</Text>}

                <AppButton title={'Allow Location Access'} onPress={handleAllow} loading={isLoading} disabled={isLoading} />

                <Pressable onPress={() => router.push('/(protected)/(onboarding)/location-manual')}>
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
