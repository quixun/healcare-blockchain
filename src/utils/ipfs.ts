import { create } from "ipfs-http-client";

// Connect to local IPFS RPC API
const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

export const uploadToIPFS = async (file: File) => {
  try {
    const added = await ipfs.add(file);
    return added.path; // Returns the CID
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
  }
};

export const fetchFromIPFS = async (cid: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_IPFS_GATEWAY_URL}/${cid}`
    );
    if (!response.ok) throw new Error("Failed to fetch content");
    return await response.text(); // Use `.blob()` for images/files
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
  }
};
