import { User, createUserWithEmailAndPassword, getIdToken, signInWithEmailAndPassword, signOut } from 'firebase/auth'

import { AuthProvider } from '../auth.provider'
import { AuthTokens, AuthUser, LoginPayload, SignUpPayload } from '../auth.types'
import { firebaseAuth } from '../firebase/firebase.config'

const mapUser = (user: User): AuthUser => ({
    id: user.uid,
    username: user.email ?? user.uid,
    email: user.email ?? undefined,
    firstName: user.displayName ?? undefined,
    image: user.photoURL ?? undefined,
})

const buildTokens = async (user: User, forceRefresh = false): Promise<AuthTokens> => {
    const accessToken = await getIdToken(user, forceRefresh)
    const refreshToken = user.refreshToken

    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
    }
}

export const firebaseAuthProvider: AuthProvider = {
    async login(payload: LoginPayload): Promise<AuthTokens> {
        const { username, email, password } = payload
        const identifier = (email ?? username ?? '').trim()
        if (!identifier || !password) {
            throw new Error('Email/username and password are required')
        }
        const credential = await signInWithEmailAndPassword(firebaseAuth, identifier, password)
        return buildTokens(credential.user)
    },
    async signUp(payload: SignUpPayload): Promise<AuthTokens> {
        const email = (payload.email ?? '').trim()
        const password = payload.password
        if (!email || !password) {
            throw new Error('Email and password are required for sign up')
        }
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        return buildTokens(credential.user)
    },
    async refresh(): Promise<AuthTokens> {
        const user = firebaseAuth.currentUser
        if (!user) {
            throw new Error('No authenticated user for refresh')
        }
        return buildTokens(user, true)
    },
    async me(): Promise<AuthUser> {
        const user = firebaseAuth.currentUser
        if (!user) {
            throw new Error('No authenticated user')
        }
        return mapUser(user)
    },
    async logout(): Promise<void> {
        await signOut(firebaseAuth)
    },
}
