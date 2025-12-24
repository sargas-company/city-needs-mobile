import axios from 'axios'

import { apiConfig } from '@/services/api/config'
import { getTokens } from '@/services/auth/session'
import { StoredLocation } from '@/services/location/location.types'

const client = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: { Accept: 'application/json' },
})

export const syncLocation = async (location: StoredLocation) => {
    const tokens = await getTokens()
    const headers = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : undefined
    await client.post(
        '/me/location',
        {
            lat: location.lat,
            lng: location.lng,
            source: location.source,
            provider: location.provider,
            placeId: location.placeId,
            formattedAddress: location.formattedAddress,
        },
        { headers }
    )
}
