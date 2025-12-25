type ErrorWithData = {
    data?: unknown
    error?: { data?: unknown }
    message?: string
}

const extractMessage = (data: unknown): string | null => {
    if (!data) return null
    if (typeof data === 'string') return data
    if (typeof data === 'object' && 'message' in data) {
        const msg = (data as { message?: unknown }).message
        if (typeof msg === 'string') return msg
    }
    return null
}

export const getLocationErrorMessage = (error: unknown, fallback = 'Failed to sync location') => {
    if (!error) return fallback
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message

    const maybe = error as ErrorWithData
    const fromData = extractMessage(maybe.data)
    if (fromData) return fromData

    const fromNested = extractMessage(maybe.error?.data)
    if (fromNested) return fromNested

    if (typeof maybe.message === 'string') return maybe.message
    return fallback
}
