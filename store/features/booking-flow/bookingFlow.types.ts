export type BookingFlowStatus = 'idle' | 'submitting' | 'submitted' | 'error'

export type BookingFlowState = {
    businessId: string | null
    selectedServiceIds: string[]
    selectedDate: string | null
    selectedTimeSlot: string | null
    notes: string
    status: BookingFlowStatus
    error: string | null
}
