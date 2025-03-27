import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Patient } from "../types/type";
import { UserRole } from "../types/enums";
import { db } from "./firebase";

// Reference to the "patients" collection
const patientCollection = collection(db, "patients");

// Add a new patient
export const addPatient = async (
  patient: Omit<Patient, "id" | "createdAt">
) => {
  const newPatient = {
    ...patient,
    role: UserRole.Patient,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(patientCollection, newPatient);
  return { id: docRef.id, ...newPatient };
};

// Get all patients
export const getPatients = async (): Promise<Patient[]> => {
  const snapshot = await getDocs(patientCollection);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      patientId: data.patientId ?? "",
      name: data.name ?? "",
      age: data.age ?? 0,
      dateOfBirth: data.dateOfBirth ?? "",
      gender: data.gender ?? "Other",
      address: data.address ?? "",
      medicalHistory: data.medicalHistory ?? [],
      medicalRecords: data.medicalRecords ?? [],
      consents: data.consents ?? [],
      transactions: data.transactions ?? [],
      blockchainAddress: data.blockchainAddress ?? "",
      createdAt: data.createdAt?.toDate() ?? new Date(),
    };
  });
};

// Update patient by ID
export const updatePatient = async (
  id: string,
  updatedData: Partial<Patient>
) => {
  const patientDoc = doc(db, "patients", id);
  await updateDoc(patientDoc, updatedData);
};

// Delete patient by ID
export const deletePatient = async (id: string) => {
  const patientDoc = doc(db, "patients", id);
  await deleteDoc(patientDoc);
};
