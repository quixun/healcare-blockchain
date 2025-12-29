import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch } from "../../features/hooks";
import Web3Service from "../../services/web3Service";
import { login } from "../../features/account/accountSlice";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import Web3 from "web3";
import { Gender, getUserName, saveUserInfo } from "../../services/user-service";
import { CAREER_GROUPS, DISEASE_GROUPS } from "@/constant/major";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [privateKey, setPrivateKey] = useState("");
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Registration Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<CAREER_GROUPS>(CAREER_GROUPS.PATIENT);
  const [major, setMajor] = useState("");

  // 1. New state for registration loading
  const [isRegistering, setIsRegistering] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    if (!privateKey.trim()) return;

    try {
      setIsLoading(true);
      const web3: Web3 = Web3Service.getInstance().getWeb3();
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const balance = await web3.eth.getBalance(account.address);
      const nonce = await web3.eth.getTransactionCount(account.address);

      const fetchedUserName = await getUserName(account.address.toLowerCase());

      if (!fetchedUserName) {
        setIsModalOpen(true);
        return;
      }

      completeLogin(
        account.address,
        web3,
        balance.toString(),
        Number(nonce),
        fetchedUserName
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!userName.trim()) return;

    if (role === CAREER_GROUPS.DOCTOR && !major) {
      toast.error("Please select a major.");
      return;
    }

    // 2. Start loading
    setIsRegistering(true);

    try {
      const web3: Web3 = Web3Service.getInstance().getWeb3();
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const balance = await web3.eth.getBalance(account.address);
      const nonce = await web3.eth.getTransactionCount(account.address);

      await saveUserInfo(account.address, {
        userName,
        career: role,
        major: role === CAREER_GROUPS.DOCTOR ? major : "",
        avatarUrl: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: Gender.OTHER,
        location: "",
      });

      completeLogin(
        account.address,
        web3,
        balance.toString(),
        Number(nonce),
        userName
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      // 3. Stop loading
      setIsRegistering(false);
    }
  };

  const completeLogin = (
    address: string,
    web3: Web3,
    balance: string,
    nonce: number,
    name: string
  ) => {
    dispatch(
      login({
        address: address,
        balance: web3.utils.fromWei(balance, "ether"),
        nonce: nonce.toString(),
        name: name,
        status: true,
      })
    );
    navigate("/");
  };

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.05 } }),
  };
  const title = "Life-changing care for anxiety, depression".split("");

  return (
    <motion.div
      className="flex min-h-screen flex-col py-20 items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      style={{
        backgroundImage: `url('https://www.brightside.com/wp-content/uploads/2024/10/homepage-hero-background.png'), linear-gradient(270deg, #d8f7f9 0.12%, #eaf8f8 49.98%)`,
        backgroundPosition: "90%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    >
      <div className="w-full max-w-7xl px-[15px] mx-auto">
        <div className="basis-1/2 max-w-1/2">
          <h1 className="mb-4 text-[#2e4985] text-[62px] leading-16">
            {title.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
              >
                {letter}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[18px] pr-12 mb-6 text-[#5e6883]"
          >
            It gets much better from here. Get 1:1 help that works, and lasts —
            from the best in online therapy and medication.
          </motion.p>

          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-full flex flex-wrap items-center">
              <motion.label className="flex-[1_1_100%] text-[#2e4985] font-outfit font-semibold text-[20px] leading-[26px] mb-[12px]">
                How can we help you today?
              </motion.label>

              <div className="flex flex-col md:flex-row items-center gap-3">
                <input
                  type="password"
                  placeholder="Enter Private Key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="flex-[1_1_72%] text-[16px] p-[12px] rounded-lg border-2 border-[#ccd1db] bg-white"
                />
                <button
                  onClick={handleLogin}
                  className={`flex-[1_1_25%] min-w-[145px] ml-[3%] bg-[#2e4985] font-outfit font-bold text-[14px] tracking-[2.4px] text-white p-[20px_24px] rounded-[40px] border-0 uppercase transition ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "GO"}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </motion.div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-2">Display Name</h2>
          <input
            type="text"
            ref={inputRef}
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <h2 className="text-lg font-bold mb-2">Your Role</h2>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as CAREER_GROUPS)}
            className="w-full border px-3 py-2 rounded-lg bg-white mb-4"
          >
            <option value={CAREER_GROUPS.PATIENT}>Patient</option>
            <option value={CAREER_GROUPS.DOCTOR}>Doctor</option>
          </select>

          {role === CAREER_GROUPS.DOCTOR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2 className="text-lg font-bold mb-2">Your Specialty</h2>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg bg-white mb-4"
              >
                <option value="">Select a specialty</option>
                {DISEASE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* 4. Updated Button with Loading State */}
          <button
            onClick={handleSaveName}
            disabled={isRegistering}
            className={`w-full px-4 py-2 rounded mt-2 text-white transition ${
              isRegistering
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isRegistering ? "Registering..." : "Complete Registration"}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Login;
