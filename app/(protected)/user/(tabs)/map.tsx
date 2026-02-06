import React, { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { FilterModal } from '@/components/filters/FilterModal'
import { filterValuesToSearchArgs, type FilterValues } from '@/components/filters/FilterModal.types'
import { CITIES } from '@/constants/cities'
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
    const { location: userLocation } = useEnsureLocation()

    // Map center for search: user location or default city
    const defaultCenter: LatLng = userLocation ?? CITIES.Saskatoon.center
    const [mapCenter, setMapCenter] = useState<LatLng>(defaultCenter)
    const [searchText, setSearchText] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState<FilterValues | null>(null)
    const appliedFiltersRef = useRef(appliedFilters)

    const queryArgs: SearchBusinessesArgs = useMemo(() => {
        const args: SearchBusinessesArgs = { limit: 50 }
        const hasSearch = !!searchText.trim()
        if (hasSearch) {
            args.search = searchText.trim()
        }
        if (appliedFilters) {
            Object.assign(args, filterValuesToSearchArgs(appliedFilters, userLocation, hasSearch))
        }
        return args
    }, [searchText, appliedFilters, userLocation])

    const insets = useSafeAreaInsets()
    const { data } = useSearchBusinessesQuery(queryArgs)
    const businesses = useMemo(() => data?.data ?? [], [data?.data])
    const markers = useMemo(() => businessesToMarkers(businesses), [businesses])

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

    const handleApplyFilters = useCallback((values: FilterValues) => {
        setAppliedFilters(values)
    }, [])

    return (
        <View style={styles.container}>
            <View style={[styles.searchBarContainer, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
                <MapSearchBar value={searchText} onChangeText={setSearchText} onSettingsPress={() => setFilterOpen(true)} placeholder="Search" />
            </View>

            <Map
                initialCenter={mapCenter}
                initialZoom={7}
                markers={markers}
                selectedMarkerId={selectedBusinessId}
                onMarkerPress={handleMarkerPress}
                onRegionChangeEnd={handleRegionChangeEnd}
                showUserLocation={true}
                userLocation={userLocation}
            />

            <FilterModal
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={handleApplyFilters}
                initialValues={appliedFiltersRef.current ?? undefined}
                hasSearch={!!searchText.trim()}
            />

            {/* Single business card overlay */}
            {selectedBusiness && (
                <View style={[styles.cardContainer, { paddingBottom: insets.bottom + 100 }]} pointerEvents="box-none">
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
