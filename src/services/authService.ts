import { db } from "../config/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { User } from "../types";

const USERS_COLLECTION = "users";

export const login = async (username: string, password: string): Promise<User | null> => {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where("username", "==", username),
            where("password", "==", password)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (e) {
        console.error("Error logging in: ", e);
        throw e;
    }
};

export const initializeDefaultUser = async () => {
    try {
        // Check if default user exists
        const q = query(
            collection(db, USERS_COLLECTION),
            where("username", "==", "solshare")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Create default admin user
            await addDoc(collection(db, USERS_COLLECTION), {
                username: "solshare",
                password: "solshare@25",
                role: "admin",
                createdAt: Date.now(),
            });
            console.log("Default user created");
        }
    } catch (e) {
        console.error("Error initializing default user: ", e);
    }
};

export const changePassword = async (userId: string, newPassword: string) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, { password: newPassword });
    } catch (e) {
        console.error("Error changing password: ", e);
        throw e;
    }
};
