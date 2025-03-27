import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Doctor } from "../types/type";
import { UserRole } from "../types/enums";
import { db } from "./firebase";

const doctorCollection = collection(db, "doctors");

// Add a new doctor
export const addDoctor = async (doctor: Omit<Doctor, "id" | "createdAt">) => {
  const newDoctor = {
    ...doctor,
    role: UserRole.Doctor,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(doctorCollection, newDoctor);
  return { id: docRef.id, ...newDoctor };
};

// Get all doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  const snapshot = await getDocs(doctorCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Doctor[];
};

// Update doctor by ID
export const updateDoctor = async (
  id: string,
  updatedData: Partial<Doctor>
) => {
  const doctorDoc = doc(db, "doctors", id);
  await updateDoc(doctorDoc, updatedData);
};

// Delete doctor by ID
export const deleteDoctor = async (id: string) => {
  const doctorDoc = doc(db, "doctors", id);
  await deleteDoc(doctorDoc);
};
