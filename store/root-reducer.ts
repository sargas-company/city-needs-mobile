import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { api } from './api/api.slice'
import { authReducer } from './auth/auth.slice'

const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['user', 'isAuth', 'status'],
}

const appReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    [api.reducerPath]: api.reducer,
})

export const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
    if (action.type === 'auth/logout') {
        return appReducer(undefined, action)
    }
    return appReducer(state, action)
}

export type RootReducer = ReturnType<typeof appReducer>
