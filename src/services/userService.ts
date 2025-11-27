import { db } from "../config/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { User } from "../types";

const USERS_COLLECTION = "users";

export const getUsers = async (): Promise<User[]> => {
    try {
        const q = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            // Don't return password in the list
            users.push({
                id: doc.id,
                username: userData.username,
                role: userData.role,
                allowedPlants: userData.allowedPlants,
                createdAt: userData.createdAt
            } as User);
        });
        return users;
    } catch (e) {
        console.error("Error getting users: ", e);
        throw e;
    }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, USERS_COLLECTION), {
            ...user,
            createdAt: Date.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding user: ", e);
        throw e;
    }
};

export const deleteUser = async (userId: string) => {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, userId));
    } catch (e) {
        console.error("Error deleting user: ", e);
        throw e;
    }
};
