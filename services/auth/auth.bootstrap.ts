import { AppDispatch } from '@/store'
import { api } from '@/store/api/api.slice'
import { clearUser, setAuthStatus } from '@/store/auth/auth.slice'

import { getTokens } from './session'

export const bootstrapAuth = async (dispatch: AppDispatch) => {
    const tokens = await getTokens()
    if (tokens?.accessToken) {
        dispatch(setAuthStatus('loading'))
        dispatch(api.endpoints.me.initiate(undefined, { forceRefetch: true, subscribe: false }))
    } else {
        dispatch(clearUser())
        dispatch(setAuthStatus('unauthenticated'))
    }
}
