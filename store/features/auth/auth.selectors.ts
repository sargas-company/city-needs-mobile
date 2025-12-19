import { RootState } from '@/store/store'

export const selectAuthState = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuth = (state: RootState) => state.auth.isAuth
export const selectAuthStatus = (state: RootState) => state.auth.status
