import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";

const USERS_COLLECTION = "users";

export const updateUserPlantAccess = async (userId: string, allowedPlants: string[]) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, { allowedPlants });
    } catch (e) {
        console.error("Error updating plant access: ", e);
        throw e;
    }
};
