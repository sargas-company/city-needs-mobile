import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { FilterModal } from '@/components/filters/FilterModal'
import { filterValuesToSearchArgs, type FilterValues } from '@/components/filters/FilterModal.types'
import { CITIES } from '@/constants/cities'
import { useDebounce } from '@/hooks/useDebounce'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'
import { Map, MapMarker, type Bounds, type LatLng } from '@/src/features/map'
import { BusinessMapCard } from '@/src/features/map/components/BusinessMapCard'
import { MapSearchBar } from '@/src/features/map/components/MapSearchBar'
import type { SearchBusinessesArgs } from '@/store/features/search/search.types'
import { useSearchBusinessesQuery } from '@/store/features/search/searchApi'

/**
 * Converts businesses with lat/lng to MapMarker[].
 * Filters out businesses without coordinates.
 */
function businessesToMarkers(businesses: { id: string; name: string; lat?: number | null; lng?: number | null }[]): MapMarker[] {
    return businesses
        .filter((b): b is typeof b & { lat: number; lng: number } => b.lat != null && b.lng != null)
        .map((b) => ({
            id: b.id,
            position: { lat: b.lat, lng: b.lng },
            title: b.name,
        }))
}

/**
 * MapScreen: Main map view for users to explore businesses.
 * Fetches businesses via useSearchBusinessesQuery and displays them as markers.
 * Map and data layer are separate: you can swap query or map component easily.
 */
export default function MapScreen() {
    const isFocused = useIsFocused()
    const { location: userLocation } = useEnsureLocation()

    // Map center for search: user location or default city
    const defaultCenter: LatLng = userLocation ?? CITIES.Saskatoon.center
    const [mapCenter, setMapCenter] = useState<LatLng>(defaultCenter)
    const [searchText, setSearchText] = useState('')
    const debouncedSearchText = useDebounce(searchText, 300)
    const [filterOpen, setFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null)
    const appliedFiltersRef = useRef(appliedFilters)

    const queryArgs: SearchBusinessesArgs = useMemo(() => {
        const args: SearchBusinessesArgs = { limit: 50 }
        const hasSearch = !!debouncedSearchText.trim()
        if (hasSearch) {
            args.search = debouncedSearchText.trim()
        }
        if (appliedFilters) {
            Object.assign(args, filterValuesToSearchArgs(appliedFilters, userLocation, hasSearch))
        }
        return args
    }, [debouncedSearchText, appliedFilters, userLocation])

    const insets = useSafeAreaInsets()
    // Skip query when tab is not focused to prevent background API calls and memory pressure
    const { data, isFetching } = useSearchBusinessesQuery(queryArgs, { skip: !isFocused })

    // Preserve previous markers while fetching to prevent native MapView child index crash
    // The crash occurs when markers array rapidly changes from populated -> empty -> populated
    const previousMarkersRef = useRef<MapMarker[]>([])
    const businesses = useMemo(() => data?.data ?? [], [data?.data])
    const currentMarkers = useMemo(() => businessesToMarkers(businesses), [businesses])

    // Only update markers when we have actual data, keep previous markers while fetching
    const markers = useMemo(() => {
        if (currentMarkers.length > 0) {
            previousMarkersRef.current = currentMarkers
            return currentMarkers
        }
        // If fetching and no current data, keep showing previous markers
        if (isFetching) {
            return previousMarkersRef.current
        }
        // Only clear markers when we're sure there are no results (not fetching, empty data)
        previousMarkersRef.current = []
        return []
    }, [currentMarkers, isFetching])

    // Auto-select first business when search results arrive
    useEffect(() => {
        if (debouncedSearchText.trim() && businesses.length > 0) {
            setSelectedBusinessId(businesses[0].id)
        }
    }, [businesses, debouncedSearchText])

    appliedFiltersRef.current = appliedFilters

    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
    const selectedBusiness = useMemo(
        () => (selectedBusinessId ? businesses.find((b) => b.id === selectedBusinessId) : null),
        [businesses, selectedBusinessId]
    )

    const handleRegionChangeEnd = useCallback((_bounds: Bounds, center: LatLng) => {
        setMapCenter(center)
    }, [])

    const handleMarkerPress = useCallback((markerId: string) => {
        setSelectedBusinessId(markerId)
    }, [])

    const handleCloseCard = useCallback(() => {
        setSelectedBusinessId(null)
    }, [])

    const handleMapPress = useCallback(() => {
        Keyboard.dismiss()
    }, [])

    const handleApplyFilters = useCallback((values: FilterValues) => {
        setAppliedFilters(values)
    }, [])

    const searchRadiusKm: 1 | 5 | null = appliedFilters?.proximity === 'within_5km' ? 5 : appliedFilters?.proximity === 'within_1km' ? 1 : null

    return (
        <View style={styles.container}>
            <View
                style={[styles.searchBarContainer, { paddingTop: insets.top + 8 }]}
                pointerEvents="box-none"
                testID="map-search-bar-container"
                accessibilityLabel="map-search-bar-container"
            >
                <MapSearchBar value={searchText} onChangeText={setSearchText} onSettingsPress={() => setFilterOpen(true)} placeholder="Search" />
            </View>

            <Map
                initialCenter={mapCenter}
                initialZoom={7}
                markers={markers}
                selectedMarkerId={selectedBusinessId}
                onMarkerPress={handleMarkerPress}
                onRegionChangeEnd={handleRegionChangeEnd}
                onPress={handleMapPress}
                showUserLocation={true}
                userLocation={userLocation}
                searchRadiusKm={searchRadiusKm}
            />

            <FilterModal
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={handleApplyFilters}
                initialValues={appliedFiltersRef.current ?? undefined}
                hasSearch={!!debouncedSearchText.trim()}
            />

            {/* Business card overlay - pointerEvents="box-none" allows tab bar touches through */}
            {selectedBusiness && (
                <View
                    style={[styles.cardContainer, { paddingBottom: insets.bottom + 100 }]}
                    pointerEvents="box-none"
                    testID="map-card-container"
                    accessibilityLabel="map-card-container"
                >
                    <BusinessMapCard business={selectedBusiness} onClose={handleCloseCard} />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    cardContainer: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
    },
})
