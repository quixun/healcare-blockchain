import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { saveUserInfo, getUserInfo, Gender } from "../../services/user-service";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/features/hooks";
import { logout } from "@/features/account/accountSlice";
import Web3Service from "@/services/web3Service";
import Modal from "../common/modal";
import { Plus } from "lucide-react";
import { create } from "ipfs-http-client";

const genderMap = {
  [Gender.MALE]: "Nam",
  [Gender.FEMALE]: "Nữ",
  [Gender.OTHER]: "Khác",
};

export default function AccountPage() {
  const { address, balance, nonce } = useSelector(
    (state: RootState) => state.account
  );
  const web3 = Web3Service.getInstance().getWeb3();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const dispatch = useAppDispatch();

  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userName: "",
    avatarUrl: "",
    bio: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    occupation: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [fadeOut, setFadeOut] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    if (!address) return;
    try {
      const userInfo = await getUserInfo(address);
      if (userInfo) {
        setUserInfo((prev) => ({ ...prev, ...userInfo }));
      }
    } catch {
      return;
    }
  }, [address]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleUpdateProfile = async () => {
    if (!address) return setMessage("Bạn chưa đăng nhập");

    try {
      setLoading(true);
      await saveUserInfo(address, userInfo);
      setMessage("Updated successfully!");
      setEditMode(false);
      fetchUserInfo();

      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 3000);
    } catch (error) {
      setMessage(`Failed,${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback(
    (field: keyof typeof userInfo, value: string | Gender) => {
      setUserInfo((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];

      // Upload the image immediately after selecting it
      await uploadToIPFS(selectedFile);
    }
  };

  // Upload image to IPFS
  const uploadToIPFS = async (file: File) => {
    try {
      const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });
      const added = await ipfs.add(file);
      const cid = added.path; // Get the CID of the uploaded file

      // Save the CID to the blockchain and sync the uploaded images
      await saveToBlockchain(cid);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  // Save the CID to the blockchain and update the uploaded images list
  const saveToBlockchain = async (cid: string) => {
    try {
      // Here you would interact with your Web3 service to save the CID
      const web3 = Web3Service.getInstance().getWeb3();

      if (!address) return;

      const imageData = `IMG:${cid}`;
      await web3.eth.sendTransaction({
        from: address,
        to: address,
        data: web3.utils.asciiToHex(imageData),
      });

      // Update the uploaded images list
      setUploadedImages((prevImages) => [cid, ...prevImages]);

      alert("Image uploaded and CID saved to blockchain!");
      toggleModal(); // Close the modal after upload
    } catch (error) {
      console.error("Error saving CID to blockchain:", error);
    }
  };

  const handleAvatarChange = useCallback(
    (cid: string) => {
      if (cid) {
        handleChange("avatarUrl", cid);
      }
      toggleModal();
    },
    [handleChange, toggleModal]
  );

  const fetchUploadedImages = useCallback(async (): Promise<string[]> => {
    try {
      if (!address) return [];

      const latestBlock = await web3.eth.getBlockNumber();
      const images: string[] = [];

      for (
        let i = latestBlock;
        i >= Math.max(Number(latestBlock) - 100, 0);
        i--
      ) {
        const block = await web3.eth.getBlock(i, true);

        block.transactions.forEach((tx) => {
          if (
            typeof tx === "object" &&
            tx.from?.toLowerCase() === address.toLowerCase() &&
            tx.input !== "0x"
          ) {
            try {
              if (!tx.input) return;
              const decodedInput = web3.utils.hexToUtf8(tx.input);

              if (decodedInput.startsWith("IMG:")) {
                const cid = decodedInput.replace("IMG:", "");
                images.push(cid);
              }
            } catch (error) {
              console.error("Error decoding transaction input:", error);
            }
          }
        });
      }

      setUploadedImages(images);
      return images;
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
      return [];
    }
  }, [address, web3.eth, web3.utils]);

  useEffect(() => {
    const fetchUploadedImage = async () => {
      try {
        const images = await fetchUploadedImages();
        setUploadedImages(images);
      } catch (error) {
        console.error("Error fetching uploaded images:", error);
      }
    };

    fetchUploadedImage();
  }, [fetchUploadedImages]);

  const maskedAddress = useMemo(() => {
    return address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "let login";
  }, [address]);

  return (
    <div className="my-20">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className={`relative z-30 w-full flex justify-center px-9 pt-16 rounded-lg ${
            editMode && "mt-20"
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-transparent shadow-lg rounded-lg p-6 w-full max-w-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Personal Information
            </h2>

            {userInfo.avatarUrl && (
              <motion.img
                src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${
                  userInfo.avatarUrl
                }`}
                alt="Avatar"
                className="w-44 h-44 rounded-full mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            <AnimatePresence>
              {message && (
                <motion.p
                  className={`text-green-600 mb-4 transition-opacity duration-1000 ${
                    fadeOut ? "opacity-0" : "opacity-100"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {editMode ? (
              <>
                {Object.entries(userInfo).map(
                  ([key, value]) =>
                    key !== "avatarUrl" && (
                      <div className="mb-4 text-left" key={key}>
                        <label className="block font-medium">
                          {key === "userName"
                            ? "Owner:"
                            : key === "bio"
                            ? "Bio:"
                            : key === "email"
                            ? "Email:"
                            : key === "phoneNumber"
                            ? "Phone Number:"
                            : key === "dateOfBirth"
                            ? "Date Of Birth:"
                            : key === "gender"
                            ? "Gender:"
                            : key === "location"
                            ? "Address:"
                            : key === "occupation"
                            ? "Career:"
                            : ""}
                        </label>
                        {key === "gender" ? (
                          <select
                            value={value as Gender}
                            onChange={(e) =>
                              handleChange(
                                key as keyof typeof userInfo,
                                e.target.value as Gender
                              )
                            }
                            className="w-full border px-3 py-2 rounded-lg"
                          >
                            {Object.values(Gender).map((g) => (
                              <option key={g} value={g}>
                                {genderMap[g]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={key === "dateOfBirth" ? "date" : "text"}
                            value={value as string}
                            onChange={(e) =>
                              handleChange(
                                key as keyof typeof userInfo,
                                e.target.value
                              )
                            }
                            className="w-full border px-3 py-2 rounded-lg"
                          />
                        )}
                      </div>
                    )
                )}

                <div className="mb-4 text-left">
                  <label className="block font-medium">Avatar:</label>
                  <button
                    className="w-full border px-3 py-2 rounded-lg"
                    onClick={toggleModal}
                  >
                    Choose your avatar
                  </button>
                </div>

                <motion.button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {loading ? "Đang lưu..." : "Lưu thông tin"}
                </motion.button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={toggleModal}
                  title="Select an Image"
                >
                  <div className="flex h-[70%] justify-center items-center w-full flex-wrap gap-2 overflow-auto">
                    {/* Show uploaded images with animation */}
                    {uploadedImages.map((url, index) => (
                      <motion.img
                        key={index}
                        src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${url}`}
                        alt={`Uploaded image ${index}`}
                        className="object-contain max-h-[150px] max-w-[150px] rounded-md cursor-pointer"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleAvatarChange(url)}
                      />
                    ))}

                    <button
                      className="w-30 h-30 flex justify-center hover:bg-gray-200 duration-150 ease-in-out items-center bg-gray-100 rounded-md border border-dashed cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus
                        size={32}
                        className="text-gray-500 hover:text-gray-700"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </button>
                  </div>
                </Modal>
              </>
            ) : (
              <motion.div
                className="text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-600">
                  <strong>Onwer:</strong>{" "}
                  {userInfo.userName || "Chưa đăng nhập"}
                </p>
                <p className="text-gray-600">
                  <strong>Wallet Address:</strong> {maskedAddress}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {userInfo.email || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600">
                  <strong>Phone Number:</strong>{" "}
                  {userInfo.phoneNumber || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600">
                  <strong>Balance:</strong> {balance || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600">
                  <strong>Amount of nonces:</strong>{" "}
                  {nonce || "Chưa cập nhật"}
                </p>
                <div className="flex gap-3 ">
                  <motion.button
                    onClick={() => setEditMode(true)}
                    className="mt-6 bg-green-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="mt-6 bg-red-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Log Out
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
