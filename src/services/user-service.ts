import { setDoc, doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase"; // Ensure this points to your initialized Firestore instance
import { CAREER_GROUPS } from "@/constant/major";

// Save user name by address
export const saveUserName = async (
  address: string,
  userName: string
): Promise<void> => {
  try {
    await setDoc(doc(db, "users", address.toLowerCase()), { userName });
  } catch (error) {
    throw new Error("Failed to save user name." + error);
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

  career: CAREER_GROUPS;
  major?: string;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface UserWithAddress extends UserInfo {
  address: string;
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

export const getAllUsers = async (): Promise<UserWithAddress[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    const users: UserWithAddress[] = querySnapshot.docs.map((doc) => {
      // The document ID is the address
      const address = doc.id;
      const data = doc.data() as UserInfo;

      return {
        ...data,
        address, // Include the address explicitly in the return object
      };
    });

    return users;
  } catch (error) {
    console.error("Error fetching all users: ", error);
    throw new Error("Failed to fetch all users.");
  }
};
