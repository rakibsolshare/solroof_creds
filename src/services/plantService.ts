import { db } from "../config/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { SolarPlant } from "../types";

const PLANTS_COLLECTION = "plants";

export const addPlant = async (plant: SolarPlant) => {
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 10000));
        const request = addDoc(collection(db, PLANTS_COLLECTION), {
            ...plant,
            createdAt: Date.now(),
        });

        const docRef = await Promise.race([request, timeout]) as any;
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getPlants = async (): Promise<SolarPlant[]> => {
    try {
        const q = query(collection(db, PLANTS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const plants: SolarPlant[] = [];
        querySnapshot.forEach((doc) => {
            plants.push({ id: doc.id, ...doc.data() } as SolarPlant);
        });
        return plants;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};

export const updatePlant = async (id: string, data: Partial<SolarPlant>) => {
    try {
        const plantRef = doc(db, PLANTS_COLLECTION, id);
        await updateDoc(plantRef, data);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

export const deletePlant = async (id: string) => {
    try {
        await deleteDoc(doc(db, PLANTS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};
