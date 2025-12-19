import { RootState } from '@/store/store'

export const selectProfileState = (state: RootState) => state.profile

export const selectProfileMe = (state: RootState) => state.profile.user
export const selectProfileUser = (state: RootState) => state.profile.user?.user ?? null

export const selectProfileStatus = (state: RootState) => state.profile.status

export const selectIsEmailVerified = (state: RootState) => state.profile.user?.user.emailVerified ?? false
export const selectOnboardingStep = (state: RootState) => state.profile.user?.user.onboardingStep ?? 0
export const selectUserRole = (state: RootState) => state.profile.user?.user.role ?? null

export const selectBusiness = (state: RootState) => state.profile.user?.business ?? null
export const selectVerification = (state: RootState) => state.profile.user?.verification ?? null
