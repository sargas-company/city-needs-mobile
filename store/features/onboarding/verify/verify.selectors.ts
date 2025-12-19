import { RootState } from '@/store'

export const selectVerifyFile = (state: RootState) => state.verify.file
export const selectVerifyStatus = (state: RootState) => state.verify.status
export const selectVerifyError = (state: RootState) => state.verify.error
