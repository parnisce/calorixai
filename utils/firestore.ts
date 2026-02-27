import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface UserData {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: any;
}

export const saveUserToFirestore = async (user: UserData) => {
    if (!user.id) return;

    const userRef = doc(db, 'users', user.id);

    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            // User doesn't exist, create simple profile
            await setDoc(userRef, {
                clerkId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: serverTimestamp(),
            });
            console.log('User saved to Firestore!');
        }
    } catch (error) {
        console.error('Error saving user to Firestore:', error);
    }
};
