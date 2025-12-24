import type { GeocodingDetails, GeocodingProvider, GeocodingResult } from '@/services/geocoding/GeocodingProvider'

const BASE_URL = 'https://nominatim.openstreetmap.org'
const MIN_INTERVAL_MS = 1000
const CACHE_TTL_MS = 5 * 60 * 1000
const USER_AGENT = 'CityNeedsApp/1.0 (support@cityneeds.app)'

let lastRequestAt = 0
const cache = new Map<string, { createdAt: number; data: GeocodingResult[] }>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const throttle = async () => {
    const now = Date.now()
    const delta = now - lastRequestAt
    if (delta < MIN_INTERVAL_MS) {
        await sleep(MIN_INTERVAL_MS - delta)
    }
    lastRequestAt = Date.now()
}

export const NominatimProvider = (): GeocodingProvider => ({
    id: 'nominatim',
    search: async (query, limit, signal) => {
        const cacheKey = `${query}:${limit}`
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
            return cached.data
        }

        await throttle()
        const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=${limit}`
        const response = await fetch(url, {
            signal,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'en',
            },
        })
        if (!response.ok) {
            throw new Error('Failed to search locations')
        }
        const data = (await response.json()) as any[]
        const results = data.map((item) => ({
            id: String(item.place_id),
            title: item.display_name,
            subtitle: item.name,
            lat: item.lat ? Number(item.lat) : undefined,
            lng: item.lon ? Number(item.lon) : undefined,
            raw: item,
        }))
        cache.set(cacheKey, { createdAt: Date.now(), data: results })
        return results
    },
    getDetails: async (id, signal): Promise<GeocodingDetails | null> => {
        await throttle()
        const url = `${BASE_URL}/lookup?format=jsonv2&place_ids=${encodeURIComponent(id)}`
        const response = await fetch(url, {
            signal,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'en',
            },
        })
        if (!response.ok) {
            return null
        }
        const data = (await response.json()) as any[]
        const item = data?.[0]
        if (!item) {
            return null
        }
        return {
            lat: Number(item.lat),
            lng: Number(item.lon),
            formattedAddress: item.display_name,
        }
    },
})
