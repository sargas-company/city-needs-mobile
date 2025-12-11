import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { baseApi } from './api/baseApi'
import { authReducer, logout } from './features/auth/auth.slice'
import { profileReducer } from './features/profile/profile.slice'

const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['user', 'isAuth', 'status', 'emailVerificationSkipped'],
}

const appReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    profile: profileReducer,
    [baseApi.reducerPath]: baseApi.reducer,
})

export const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
    if (action.type === logout.type) {
        return appReducer(undefined, action)
    }
    return appReducer(state, action)
}

export type RootReducer = ReturnType<typeof appReducer>
