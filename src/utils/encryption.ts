import CryptoJS from "crypto-js";

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]; // Remove header
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Encrypt file content
export const encryptFileContent = async (
  file: File,
  secretKey: string
): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const encrypted = CryptoJS.AES.encrypt(base64Data, secretKey).toString();
  return encrypted;
};

export const decryptFileContent = (
  encryptedText: string,
  secretKey: string
): string => {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey);
  const base64Data = decrypted.toString(CryptoJS.enc.Utf8);
  return base64Data;
};

export const fetchAndDecryptFiles = async (
  cids: string[],
  secretKey: string
): Promise<string[]> => {
  const decryptedFiles: string[] = [];

  for (const cid of cids) {
    try {

      // const url = `${import.meta.env.VITE_IPFS_GATEWAY_URL}/${cid}`; // You can swap in your gateway
      const url = `http://127.0.0.1:8080/ipfs/${cid}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch CID: ${cid}`, response.statusText);
        continue;
      }

      const encryptedText = await response.text();

      const decryptedBase64 = decryptFileContent(encryptedText, secretKey);

      // Check if decryption returned something
      if (!decryptedBase64) {
        console.warn(`Decryption failed for CID: ${cid}`);
        continue;
      }

      const dataUrl = `data:image/jpeg;base64,${decryptedBase64}`;

      decryptedFiles.push(dataUrl);
    } catch (err) {
      console.error(`Error processing CID ${cid}:`, err);
    }
  }

  return decryptedFiles;
};

export const decryptText = (
  encryptedBase64: string,
  secretKey: string
): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedBase64, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
