import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { AppUser, MeLocationDto } from '@/store/features/profile/profile.types'

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ProfileState {
    user: AppUser | null
    status: ProfileStatus
    error?: string | null
}

const initialState: ProfileState = {
    user: null,
    status: 'idle',
    error: null,
}

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfileUser: (state, action: PayloadAction<AppUser>) => {
            state.user = action.payload
            state.status = 'ready'
            state.error = null
        },
        setProfileLocation: (state, action: PayloadAction<MeLocationDto>) => {
            if (state.user) {
                state.user.location = action.payload
            }
        },
        clearProfile: (state) => {
            state.user = null
            state.status = 'idle'
            state.error = null
        },
        setProfileStatus: (state, action: PayloadAction<ProfileStatus>) => {
            state.status = action.payload
        },
        setProfileError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
            state.status = 'error'
        },
    },
})

export const { setProfileUser, setProfileLocation, clearProfile, setProfileStatus, setProfileError } = profileSlice.actions
export const profileReducer = profileSlice.reducer
