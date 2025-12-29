import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { saveUserInfo, getUserInfo, Gender, UserInfo } from "../../services/user-service";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/features/hooks";
import { logout } from "@/features/account/accountSlice";
import Web3Service from "@/services/web3Service";
import Modal from "../common/modal";
import { Plus } from "lucide-react";
import { create } from "ipfs-http-client";
import { useNavigate } from "react-router-dom";
import { CAREER_GROUPS, DISEASE_GROUPS } from "@/constant/major";
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
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);

  // 2. Added 'major' to userInfo state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userName: "",
    avatarUrl: "",
    bio: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    career: CAREER_GROUPS.PATIENT,
    major: "",
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
      await uploadToIPFS(selectedFile);
    }
  };

  const uploadToIPFS = async (file: File) => {
    try {
      const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });
      const added = await ipfs.add(file);
      const cid = added.path;
      await saveToBlockchain(cid);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  const saveToBlockchain = async (cid: string) => {
    try {
      const web3 = Web3Service.getInstance().getWeb3();
      if (!address) return;

      const imageData = `IMG:${cid}`;
      await web3.eth.sendTransaction({
        from: address,
        to: address,
        data: web3.utils.asciiToHex(imageData),
      });

      setUploadedImages((prevImages) => [cid, ...prevImages]);
      toggleModal();
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
    <div className="my-2">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className={`relative z-30 w-full flex justify-center px-9 rounded-lg ${
            editMode && ""
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
                className="w-44 h-44 rounded-full mx-auto mb-4 object-cover"
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
                        <label className="block font-medium mb-1">
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
                            : key === "major" // Label for Major
                            ? "Medical Major / Specialty:"
                            : key === "location"
                            ? "Address:"
                            : key === "occupation"
                            ? "Career:"
                            : ""}
                        </label>

                        {/* 3. Dropdown for Major */}
                        {key === "major" ? (
                          <select
                            value={value as string}
                            onChange={(e) =>
                              handleChange(
                                key as keyof typeof userInfo,
                                e.target.value
                              )
                            }
                            className="w-full border px-3 py-2 rounded-lg bg-white"
                          >
                            <option value="">Select a specialty</option>
                            {DISEASE_GROUPS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        ) : key === "gender" ? (
                          <select
                            value={value as Gender}
                            onChange={(e) =>
                              handleChange(
                                key as keyof typeof userInfo,
                                e.target.value as Gender
                              )
                            }
                            className="w-full border px-3 py-2 rounded-lg bg-white"
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
                    className="w-full border px-3 py-2 rounded-lg hover:bg-gray-50"
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
                  {loading ? "Saving..." : "Save Information"}
                </motion.button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={toggleModal}
                  title="Select an Image"
                >
                  <div className="flex h-[70%] justify-center items-center w-full flex-wrap gap-2 overflow-auto">
                    {uploadedImages.map((url, index) => (
                      <motion.img
                        key={index}
                        src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${url}`}
                        alt={`Uploaded image ${index}`}
                        className="object-contain max-h-[150px] max-w-[150px] rounded-md cursor-pointer border hover:border-blue-500"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleAvatarChange(url)}
                      />
                    ))}

                    <button
                      className="w-32 h-32 flex justify-center hover:bg-gray-200 duration-150 ease-in-out items-center bg-gray-100 rounded-md border-2 border-dashed cursor-pointer"
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
                className="text-left space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-600 border-b pb-2">
                  <strong>Owner:</strong>{" "}
                  {userInfo.userName || "Chưa đăng nhập"}
                </p>

                {/* 4. Display Major in read-only mode */}
                {userInfo.major && (
                  <p className="text-gray-600 border-b pb-2">
                    <strong>Major/Specialty:</strong> {userInfo.major}
                  </p>
                )}

                <p className="text-gray-600 border-b pb-2">
                  <strong>Wallet Address:</strong> {maskedAddress}
                </p>
                <p className="text-gray-600 border-b pb-2">
                  <strong>Email:</strong> {userInfo.email || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600 border-b pb-2">
                  <strong>Phone Number:</strong>{" "}
                  {userInfo.phoneNumber || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600 border-b pb-2">
                  <strong>Gender:</strong>{" "}
                  {genderMap[userInfo.gender] || userInfo.gender}
                </p>
                <p className="text-gray-600 border-b pb-2">
                  <strong>Balance:</strong> {balance || "Chưa cập nhật"}
                </p>
                <p className="text-gray-600 pb-2">
                  <strong>Amount of nonces:</strong> {nonce || "Chưa cập nhật"}
                </p>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setEditMode(true)}
                    className="bg-green-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full shadow-md"
                    whileHover={{ scale: 1.02 }}
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full shadow-md"
                    whileHover={{ scale: 1.02 }}
                  >
                    Log Out
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => navigate("/my-products")}
                  className="mt-4 bg-blue-500 cursor-pointer text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 ease-in-out w-full font-medium shadow-md flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  My Product
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
