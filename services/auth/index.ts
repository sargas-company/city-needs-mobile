import { setAuthProvider } from './auth.service'
import { firebaseAuthProvider } from './providers/firebase.provider'

setAuthProvider(firebaseAuthProvider)

export * from './auth.types'
export * from './auth.provider'
export * from './auth.service'
export * from './session'
export * from './providers/firebase.provider'
export * from './firebaseAuthError'

export const configureAuthProvider = setAuthProvider
