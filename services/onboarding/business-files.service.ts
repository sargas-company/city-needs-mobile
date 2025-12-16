export type PickedFile = {
    uri: string
    name: string
    type: string
    size?: number
}

export type BusinessFilesPayload = {
    logo: PickedFile | null
    photos: PickedFile[]
    documents: PickedFile[]
}

export const buildBusinessFilesFormData = (files: BusinessFilesPayload): FormData => {
    const formData = new FormData()

    formData.append('action', 'BUSINESS_FILES')
    formData.append('payload', JSON.stringify({}))

    if (files.logo) {
        formData.append('logo', {
            uri: files.logo.uri,
            name: files.logo.name,
            type: files.logo.type,
        } as any)
    }

    files.photos.forEach((photo) => {
        formData.append('photos', {
            uri: photo.uri,
            name: photo.name,
            type: photo.type,
        } as any)
    })

    files.documents.forEach((doc) => {
        formData.append('documents', {
            uri: doc.uri,
            name: doc.name,
            type: doc.type,
        } as any)
    })

    return formData
}
