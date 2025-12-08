import { setAuthProvider } from './auth.service'
import { dummyJsonAuthProvider } from './providers/dummyjson.provider'

setAuthProvider(dummyJsonAuthProvider)

export * from './auth.types'
export * from './auth.provider'
export * from './auth.service'
export * from './session'
export * from './providers/dummyjson.provider'

export const configureAuthProvider = setAuthProvider
