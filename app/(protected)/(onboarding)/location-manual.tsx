import React, { useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'

import { useLazyGetLocationDetailsQuery, useLazySearchLocationsQuery } from '@/store/api/geocodingApi'
import { getGeocodingProviderId } from '@/services/geocoding/GeocodingProvider'
import { getCurrentPosition, openSettings, requestLocationPermission, reverseGeocode } from '@/services/location/LocationService'
import { syncLocation } from '@/services/location/locationApi'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectLocationPermission } from '@/store/features/location/location.selectors'
import type { StoredLocation } from '@/services/location/location.types'
import { AppInput } from '@/components/ui/AppInput'

const LocationManual = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const permission = useAppSelector(selectLocationPermission)
    const providerId = getGeocodingProviderId()

    const [query, setQuery] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [debouncedQuery, setDebouncedQuery] = useState('')

    const [triggerSearch, searchResult] = useLazySearchLocationsQuery()
    const [triggerDetails] = useLazyGetLocationDetailsQuery()
    const lastSearchRef = useRef<ReturnType<typeof triggerSearch> | null>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query.trim())
        }, 300)
        return () => clearTimeout(timeout)
    }, [query])

    useEffect(() => {
        if (!debouncedQuery) {
            lastSearchRef.current?.abort()
            return
        }
        lastSearchRef.current?.abort()
        lastSearchRef.current = triggerSearch({ query: debouncedQuery, limit: 15 })
    }, [debouncedQuery, triggerSearch])

    const searchErrorMessage =
        (searchResult.error as { data?: string })?.data ??
        (searchResult.error as { error?: { data?: string } })?.error?.data ??
        (searchResult.error as { message?: string })?.message ??
        (typeof searchResult.error === 'string' ? searchResult.error : null)

    const handleSelect = async (item: { id: string; title: string; subtitle?: string; lat?: number; lng?: number }) => {
        setSubmitError(null)
        try {
            let lat = item.lat
            let lng = item.lng
            let formattedAddress = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title

            if (!lat || !lng) {
                const details = await triggerDetails({ id: item.id }).unwrap()
                lat = details.lat
                lng = details.lng
                formattedAddress = details.formattedAddress ?? formattedAddress
            }

            if (lat == null || lng == null) {
                throw new Error('Location details are missing')
            }

            const payload: StoredLocation = {
                lat,
                lng,
                source: 'manual',
                provider: providerId,
                placeId: item.id,
                formattedAddress,
                updatedAt: new Date().toISOString(),
            }
            dispatch(setLocation(payload))
            void syncLocation(payload).catch(() => undefined)
            router.replace('/(protected)/gate')
        } catch (err) {
            setSubmitError((err as Error)?.message ?? 'Failed to select location')
        }
    }

    const handleUseCurrentLocation = async () => {
        setSubmitError(null)
        try {
            const status = await requestLocationPermission()
            dispatch(setLocationPermission(status))
            if (status !== 'granted') {
                setSubmitError('Location permission is required to continue.')
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
            setSubmitError((err as Error)?.message ?? 'Failed to get current location')
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6 py-4">
            <View className="mb-4 flex-row items-center gap-3">
                <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full border border-gray-200">
                    <Text className="text-lg text-brand">{'‹'}</Text>
                </Pressable>

                <Text className="text-lg font-semibold text-brand">Enter Your Location</Text>
            </View>

            <View className="flex-row mb-3 items-center justify-between">
                <AppInput placeholder={'Search location'} value={query} clearable onClear={() => setQuery('')} onChangeText={setQuery} />
            </View>

            <Pressable onPress={handleUseCurrentLocation} className="p-2 mb-4 flex-row items-center gap-2">
                <View>
                    <FontAwesome6 name="location-arrow" size={14} color="#0C2A63" />
                </View>
                <Text className="text-base text-brand">Use my current location</Text>
            </Pressable>

            <View className="flex-row items-center ">
                <View className="flex-1 h-px bg-gray-300" />
            </View>
            {!!submitError && <Text className="mb-2 text-sm font-semibold text-red-600">{submitError}</Text>}
            {!!searchErrorMessage && <Text className="mb-2 text-sm font-semibold text-red-600">{searchErrorMessage}</Text>}

            <FlatList
                data={searchResult.data ?? []}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                    <Pressable onPress={() => handleSelect(item)} className="border-b border-[#F3F4F6] py-3">
                        <Text className="text-sm font-semibold text-[#111827]">{item.title}</Text>
                        {item.subtitle ? <Text className="text-xs text-[#6B7280]">{item.subtitle}</Text> : null}
                    </Pressable>
                )}
                ListEmptyComponent={
                    debouncedQuery ? (
                        <Text className="mt-4 text-sm text-[#6B7280]">No results found</Text>
                    ) : (
                        <Text className="mt-4 text-sm text-[#6B7280]">Start typing to search</Text>
                    )
                }
            />

            {permission === 'denied' ? (
                <Pressable onPress={openSettings} className="mt-4">
                    <Text className="text-sm font-semibold text-brand">Open Settings</Text>
                </Pressable>
            ) : null}

            {providerId === 'nominatim' ? <Text className="mt-4 text-xs text-[#9CA3AF]">Search powered by OpenStreetMap</Text> : null}
        </SafeAreaView>
    )
}

export default LocationManual
