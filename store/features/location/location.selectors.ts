import { RootState } from '@/store/store'

export const selectLocation = (state: RootState) => state.location.location
export const selectLocationPermission = (state: RootState) => state.location.permission
export const selectLocationError = (state: RootState) => state.location.error
export const selectSelectedCity = (state: RootState) => state.location.selectedCity
