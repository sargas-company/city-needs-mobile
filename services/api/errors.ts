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
