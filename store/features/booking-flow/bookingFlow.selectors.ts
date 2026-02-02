import { RootState } from '@/store/store'

export const selectBookingFlow = (state: RootState) => state.bookingFlow
export const selectBookingBusinessId = (state: RootState) => state.bookingFlow.businessId
export const selectSelectedServiceIds = (state: RootState) => state.bookingFlow.selectedServiceIds
export const selectSelectedDate = (state: RootState) => state.bookingFlow.selectedDate
export const selectSelectedTimeSlot = (state: RootState) => state.bookingFlow.selectedTimeSlot
export const selectBookingNotes = (state: RootState) => state.bookingFlow.notes
export const selectBookingFlowStatus = (state: RootState) => state.bookingFlow.status
export const selectBookingFlowError = (state: RootState) => state.bookingFlow.error
export const selectIsBookingReady = (state: RootState) => {
    const { businessId, selectedServiceIds, selectedTimeSlot } = state.bookingFlow
    return !!businessId && selectedServiceIds.length > 0 && !!selectedTimeSlot
}
