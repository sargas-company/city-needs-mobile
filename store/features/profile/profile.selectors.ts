import { RootState } from '@/store/store'

export const selectProfileState = (state: RootState) => state.profile
export const selectProfileUser = (state: RootState) => state.profile.user
export const selectProfileStatus = (state: RootState) => state.profile.status
export const selectIsEmailVerified = (state: RootState) => state.profile.user?.emailVerified ?? false
export const selectOnboardingStep = (state: RootState) => state.profile.user?.onboardingStep ?? 0
export const selectUserRole = (state: RootState) => state.profile.user?.role ?? null
