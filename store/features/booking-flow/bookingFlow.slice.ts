import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { BookingFlowState } from './bookingFlow.types'

const initialState: BookingFlowState = {
    businessId: null,
    selectedServiceIds: [],
    selectedDate: null,
    selectedTimeSlot: null,
    notes: '',
    status: 'idle',
    error: null,
}

const bookingFlowSlice = createSlice({
    name: 'bookingFlow',
    initialState,
    reducers: {
        initBookingFlow: (state, action: PayloadAction<{ businessId: string }>) => {
            Object.assign(state, initialState)
            state.businessId = action.payload.businessId
        },
        toggleService: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const idx = state.selectedServiceIds.indexOf(id)
            if (idx >= 0) {
                state.selectedServiceIds.splice(idx, 1)
            } else {
                state.selectedServiceIds.push(id)
            }
        },
        setSelectedServices: (state, action: PayloadAction<string[]>) => {
            state.selectedServiceIds = action.payload
        },
        setSelectedDate: (state, action: PayloadAction<string>) => {
            state.selectedDate = action.payload
            state.selectedTimeSlot = null
        },
        setSelectedTimeSlot: (state, action: PayloadAction<string>) => {
            state.selectedTimeSlot = action.payload
        },
        setNotes: (state, action: PayloadAction<string>) => {
            state.notes = action.payload
        },
        setBookingSubmitting: (state) => {
            state.status = 'submitting'
            state.error = null
        },
        setBookingSubmitted: (state) => {
            state.status = 'submitted'
        },
        setBookingError: (state, action: PayloadAction<string>) => {
            state.status = 'error'
            state.error = action.payload
        },
        resetBookingFlow: () => initialState,
    },
})

export const {
    initBookingFlow,
    toggleService,
    setSelectedServices,
    setSelectedDate,
    setSelectedTimeSlot,
    setNotes,
    setBookingSubmitting,
    setBookingSubmitted,
    setBookingError,
    resetBookingFlow,
} = bookingFlowSlice.actions

export const bookingFlowReducer = bookingFlowSlice.reducer
