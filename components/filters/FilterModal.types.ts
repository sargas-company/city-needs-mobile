import type { City } from '@/constants/cities'
import type { SearchBusinessesArgs } from '@/store/features/search/search.types'

export type ProximityOption = 'near_me' | 'in_my_area' | 'within_5km' | 'within_1km'

export type FilterValues = {
    categoryId: string | null
    city: City | null
    proximity: ProximityOption | null
    priceMax: number
    availabilityDate: string | null
    availabilityHour: number
    availabilityMinute: number
    availabilityPeriod: 'AM' | 'PM'
}

export const DEFAULT_FILTER_VALUES: FilterValues = {
    categoryId: null,
    city: null,
    proximity: null,
    priceMax: 4000,
    availabilityDate: null,
    availabilityHour: 12,
    availabilityMinute: 0,
    availabilityPeriod: 'AM',
}

export type FilterModalProps = {
    visible: boolean
    onClose: () => void
    onApply: (values: FilterValues) => void
    initialValues?: Partial<FilterValues>
    /** When false, service-specific filters (price, date, time) are disabled */
    hasSearch?: boolean
}

/**
 * Convert FilterValues + user GPS coords into SearchBusinessesArgs params.
 * Service-specific filters (price, date, time) are only applied when hasSearch is true.
 */
export function filterValuesToSearchArgs(
    filters: FilterValues,
    userLocation: { lat: number; lng: number } | null,
    hasSearch = false
): Partial<SearchBusinessesArgs> {
    const args: Partial<SearchBusinessesArgs> = {}

    // Business filters (always applied)
    if (filters.categoryId) {
        args.categoryId = filters.categoryId
    }

    if (filters.city) {
        args.city = filters.city
    }

    if (filters.proximity && userLocation) {
        args.lat = userLocation.lat
        args.lng = userLocation.lng

        switch (filters.proximity) {
            case 'near_me':
                args.sort = 'nearby'
                break
            case 'in_my_area':
                args.withinKm = 5
                args.sort = 'nearby'
                break
            case 'within_5km':
                args.withinKm = 5
                args.sort = 'nearby'
                break
            case 'within_1km':
                args.withinKm = 1
                args.sort = 'nearby'
                break
        }
    }

    // Service filters (only applied when searching for services)
    if (hasSearch) {
        if (filters.priceMax < 4000) {
            args.priceMax = filters.priceMax
        }

        if (filters.availabilityDate) {
            args.availabilityDate = filters.availabilityDate

            const hour24 =
                filters.availabilityPeriod === 'AM'
                    ? filters.availabilityHour === 12
                        ? 0
                        : filters.availabilityHour
                    : filters.availabilityHour === 12
                      ? 12
                      : filters.availabilityHour + 12

            const hh = String(hour24).padStart(2, '0')
            const mm = String(filters.availabilityMinute).padStart(2, '0')
            args.availabilityTime = `${hh}:${mm}`
        }
    }

    return args
}
