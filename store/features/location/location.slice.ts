import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { LocationPermissionStatus, StoredLocation } from '@/services/location/location.types'

export type LocationState = {
    location: StoredLocation | null
    permission: LocationPermissionStatus
    error: string | null
}

const initialState: LocationState = {
    location: null,
    permission: 'undetermined',
    error: null,
}

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action: PayloadAction<StoredLocation>) => {
            state.location = action.payload
            state.error = null
        },
        setLocationPermission: (state, action: PayloadAction<LocationPermissionStatus>) => {
            state.permission = action.payload
        },
        setLocationError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        clearLocation: (state) => {
            state.location = null
            state.error = null
        },
    },
})

export const { setLocation, setLocationPermission, setLocationError, clearLocation } = locationSlice.actions
export const locationReducer = locationSlice.reducer
