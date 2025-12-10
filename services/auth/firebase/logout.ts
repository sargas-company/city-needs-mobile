import { signOut } from 'firebase/auth'

import { firebaseAuth } from './firebase.config'

export const firebaseSignOut = () => signOut(firebaseAuth)
