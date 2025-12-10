import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '../index'
import { AppUser } from './profile.types'

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

export const { setProfileUser, clearProfile, setProfileStatus, setProfileError } = profileSlice.actions
export const profileReducer = profileSlice.reducer

export const selectProfileState = (state: RootState) => state.profile
export const selectProfileUser = (state: RootState) => state.profile.user
export const selectProfileStatus = (state: RootState) => state.profile.status
