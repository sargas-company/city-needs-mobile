import { createApi } from '@reduxjs/toolkit/query/react'
import axios from 'axios'

import { apiConfig } from '@/services/api/config'

import { axiosBaseQuery } from './axiosBaseQuery'

const apiClient = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: { Accept: 'application/json' },
})

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ client: apiClient }),
    keepUnusedDataFor: 30, // Clean up unused cache entries after 30s (default 60s) to reduce memory
    tagTypes: [
        'Me',
        'Profile',
        'AnyFutureEntity',
        'VerificationFile',
        'SavedBusinesses',
        'BusinessServices',
        'Bookings',
        'PublicBusiness',
        'Availability',
        'Reviews',
        'Businesses',
        'Reels',
        'Analytics',
    ],
    endpoints: () => ({}),
})
