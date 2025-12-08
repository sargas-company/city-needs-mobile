import { isAxiosError } from 'axios'

import { ApiErrorPayload } from './types'

export class ApiError extends Error {
    status?: number
    code?: string
    data?: unknown

    constructor({ message, code, status, data }: ApiErrorPayload) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.data = data
    }
}

export const toApiError = (error: unknown): ApiError => {
    if (error instanceof ApiError) {
        return error
    }

    if (isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; code?: string } | undefined
        return new ApiError({
            message: responseData?.message ?? error.message,
            code: responseData?.code ?? error.code,
            status: error.response?.status,
            data: responseData,
        })
    }

    if (error instanceof Error) {
        return new ApiError({ message: error.message })
    }

    return new ApiError({ message: 'Unknown error' })
}
