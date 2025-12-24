import type { GeocodingDetails, GeocodingProvider, GeocodingResult } from '@/services/geocoding/GeocodingProvider'

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1'

const buildSubtitle = (item: { admin1?: string; admin2?: string; country?: string }) => {
    const parts = [item.admin1, item.admin2, item.country].filter(Boolean)
    return parts.length ? parts.join(', ') : undefined
}

export const OpenMeteoProvider = (): GeocodingProvider => ({
    id: 'open-meteo',
    search: async (query, limit, signal) => {
        const url = `${BASE_URL}/search?name=${encodeURIComponent(query)}&count=${limit}&language=en&format=json`
        const response = await fetch(url, { signal })
        if (!response.ok) {
            throw new Error('Failed to search locations')
        }
        const data = (await response.json()) as { results?: any[] }
        const results = data.results ?? []
        return results.map((item) => ({
            id: String(item.id),
            title: item.name,
            subtitle: buildSubtitle(item),
            lat: item.latitude,
            lng: item.longitude,
            raw: item,
        })) as GeocodingResult[]
    },
    getDetails: async (id, signal): Promise<GeocodingDetails | null> => {
        const url = `${BASE_URL}/get?id=${encodeURIComponent(id)}`
        const response = await fetch(url, { signal })
        if (!response.ok) {
            return null
        }
        const data = (await response.json()) as { results?: any[] }
        const item = data.results?.[0]
        if (!item) {
            return null
        }
        return {
            lat: item.latitude,
            lng: item.longitude,
            formattedAddress: buildSubtitle(item),
        }
    },
})
