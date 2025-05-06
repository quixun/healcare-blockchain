import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const CHAT_COLLECTION = "chats";

// Define message type
export type ChatMessage = {
  id?: string;
  role: "user" | "ai";
  content: {
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
  };
  timestamp: number;
  userAddress: string; // Store the user's blockchain address
};

// Add a new message to Firestore, associated with a specific user
export const addMessageToFirestore = async (
  message: Omit<ChatMessage, "id">
) => {
  try {
    const userDocRef = doc(db, CHAT_COLLECTION, message.userAddress);
    const userSnapshot = await getDoc(userDocRef); // Check if user doc exists

    const conversationId = generateConversationId(message.timestamp); // Generate a conversation key
    const messageData = {
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    };

    if (!userSnapshot.exists()) {
      // If the user document doesn't exist, create it with the new conversation
      await setDoc(userDocRef, { [conversationId]: [messageData] });
    } else {
      // If user exists, update conversation array
      await updateDoc(userDocRef, {
        [conversationId]: arrayUnion(messageData),
      });
    }
  } catch (error) {
    console.error("Error adding message:", error);
  }
};

// Function to generate a conversation ID based on timestamp
const generateConversationId = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${Math.floor(date.getTime() / (1000 * 60 * 30))}`;
};

export const fetchMessagesFromFirestore = (
  userAddress: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const userDocRef = doc(db, CHAT_COLLECTION, userAddress);

  const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
    if (!docSnapshot.exists()) {
      console.warn("No chat history found for this user.");
      callback([]);
      return;
    }

    const conversations = docSnapshot.data(); // Retrieve stored conversation objects
    const messages: ChatMessage[] = [];

    Object.values(conversations).forEach((conversation) => {
      if (Array.isArray(conversation)) {
        messages.push(...conversation);
      }
    });

    // Sort messages by timestamp before sending them to the callback
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });

  return unsubscribe; // Allow unsubscribing when component unmounts
};

// Fetch all conversation IDs associated with a user
export const fetchUserConversations = async (userAddress: string) => {
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      where("userAddress", "==", userAddress)
    );
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map((doc) => doc.id);
    return conversations;
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    return [];
  }
};

export const deleteConversationFromFirestore = async (
  userAddress: string,
  conversationId: string
) => {
  const userDocRef = doc(db, "chats", userAddress);

  try {
    await updateDoc(userDocRef, {
      [conversationId]: [], // Clear messages in this conversation
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};
