import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Ensure this points to your initialized Firestore instance

// Save user name by address
export const saveUserName = async (
  address: string,
  userName: string
): Promise<void> => {
  try {
    await setDoc(doc(db, "users", address.toLowerCase()), { userName });
    console.log("User name saved successfully");
  } catch (error) {
    console.error("Error saving user name: ", error);
    throw new Error("Failed to save user name.");
  }
};

// Get user name by address
export const getUserName = async (address: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", address));
    if (userDoc.exists()) {
      return userDoc.data().userName as string;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user name: ", error);
    throw new Error("Failed to fetch user name.");
  }
};

// Save user info by address (extended version)
export const saveUserInfo = async (
  address: string,
  userInfo: UserInfo
): Promise<void> => {
  try {
    await setDoc(doc(db, "users", address.toLowerCase()), userInfo, {
      merge: true,
    });
  } catch (error) {
    throw new Error(`Failed to save user information, ${error}`);
  }
};

export interface UserInfo {
  userName: string;
  avatarUrl: string;
  bio?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  location: string;
  occupation: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// Fetch user information by address
export const getUserInfo = async (
  address: string
): Promise<UserInfo | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", address.toLowerCase()));
    if (userDoc.exists()) {
      return userDoc.data() as UserInfo;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user information: ", error);
    throw new Error("Failed to fetch user info.");
  }
};
