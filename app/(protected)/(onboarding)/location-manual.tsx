import React, { useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather'

import { useLazyGetLocationDetailsQuery, useLazySearchLocationsQuery } from '@/store/api/geocodingApi'
import { getGeocodingProviderId } from '@/services/geocoding/GeocodingProvider'
import { openSettings } from '@/services/location/LocationService'
import { getLocationErrorMessage } from '@/services/location/locationErrors'
import { submitGpsLocation } from '@/services/location/submitLocation'
import { useSyncLocationMutation } from '@/store/api/locationApi'
import { setLocation, setLocationPermission } from '@/store/features/location/location.slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectLocationPermission } from '@/store/features/location/location.selectors'
import type { StoredLocation } from '@/services/location/location.types'
import { AppInput } from '@/components/ui/AppInput'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

const LocationManual = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>()
    const isFromProfile = fromProfile === 'true'
    const permission = useAppSelector(selectLocationPermission)
    const providerId = getGeocodingProviderId()

    const [query, setQuery] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [debouncedQuery, setDebouncedQuery] = useState('')

    const [triggerSearch, searchResult] = useLazySearchLocationsQuery()
    const [triggerDetails] = useLazyGetLocationDetailsQuery()
    const [syncLocation, syncLocationState] = useSyncLocationMutation()
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

            if (lat == null || lng == null) {
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
            const response = await syncLocation(payload).unwrap()
            if (response.ok && response.location) {
                dispatch(setLocation(response.location))
            }
            if (isFromProfile) {
                router.dismiss(2)
            } else {
                router.replace('/(protected)/gate')
            }
        } catch (err) {
            setSubmitError(getLocationErrorMessage(err, 'Failed to select location'))
        }
    }

    const handleUseCurrentLocation = async () => {
        setSubmitError(null)
        try {
            const result = await submitGpsLocation({
                onPermission: (status) => dispatch(setLocationPermission(status)),
                onStored: (payload) => dispatch(setLocation(payload)),
                sync: (payload) => syncLocation(payload).unwrap(),
            })
            if (!result.ok && result.reason === 'permission') {
                setSubmitError('Location permission is required to continue.')
                return
            }
            if (result.ok && result.response.ok && result.response.location) {
                dispatch(setLocation(result.response.location))
            }
            if (isFromProfile) {
                router.dismiss(2)
            } else {
                router.replace('/(protected)/gate')
            }
        } catch (err) {
            setSubmitError(getLocationErrorMessage(err, 'Failed to get current location'))
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6 pb-4" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <View className="mb-4 flex-row items-center gap-3">
                <Pressable
                    onPress={() => router.back()}
                    className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
                    accessibilityRole="button"
                >
                    <Feather name="arrow-left" size={20} color="#0C2A63" />
                </Pressable>

                <Text className="text-lg font-semibold text-brand">Enter Your Location</Text>
            </View>

            <View className="flex-row mb-3 items-center justify-between">
                <AppInput placeholder={'Search location'} value={query} clearable onClear={() => setQuery('')} onChangeText={setQuery} />
            </View>

            <Pressable onPress={handleUseCurrentLocation} className="p-2 mb-4 flex-row items-center gap-2" disabled={syncLocationState.isLoading}>
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
                    <Pressable
                        onPress={() => handleSelect(item)}
                        disabled={syncLocationState.isLoading}
                        className={`border-b border-[#F3F4F6] py-3 ${syncLocationState.isLoading ? 'opacity-60' : ''}`}
                    >
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
        </SafeAreaView>
    )
}

export default LocationManual
