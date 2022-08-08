import { signInAnonymously, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./init";


export const signIn = async(): ReturnType<typeof signInAnonymously> => {
    try {
        return signInAnonymously(auth);
    } catch(error) {
        console.error(error);
        throw error;
    }
}

export const signOut = async(): ReturnType<typeof firebaseSignOut> => {
    try {
        await firebaseSignOut(auth);
    } catch(error: unknown) {
        console.error(error);
        throw error;
    }
}