import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { baseApi } from './api/baseApi'
import { authReducer, logout } from './features/auth/auth.slice'
import { locationReducer } from './features/location/location.slice'
import { profileReducer } from './features/profile/profile.slice'
import { uploadSessionReducer } from './features/uploadSession/uploadSession.slice'
import { verifyReducer } from './features/onboarding/verify/verify.slice'

const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['user', 'isAuth', 'status'],
}

const locationPersistConfig = {
    key: 'location',
    storage: AsyncStorage,
    whitelist: ['location', 'permission'],
}

const appReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    profile: profileReducer,
    location: persistReducer(locationPersistConfig, locationReducer),
    uploadSession: uploadSessionReducer,
    verify: verifyReducer,
    [baseApi.reducerPath]: baseApi.reducer,
})

export const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
    if (action.type === logout.type) {
        return appReducer(undefined, action)
    }
    return appReducer(state, action)
}

export type RootReducer = ReturnType<typeof appReducer>
