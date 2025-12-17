export type PickedFile = {
    uri: string
    name: string
    type: string
    size?: number
}

export type ProviderVerifyPayload = {
    document: PickedFile | null
}

export const buildProviderVerifyFormData = (payload: ProviderVerifyPayload): FormData => {
    const fd = new FormData()
    fd.append('action', 'BUSINESS_VERIFY')
    fd.append('payload', JSON.stringify({}))

    if (payload.document) {
        fd.append('documents', {
            uri: payload.document.uri,
            name: payload.document.name,
            type: payload.document.type,
        } as any)
    }

    return fd
}
