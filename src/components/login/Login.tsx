import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch } from "../../features/hooks";
import Web3Service from "../../services/web3Service";
import { login } from "../../features/account/accountSlice";
import { useNavigate } from "react-router";
import Modal from "../common/modal";
import Web3 from "web3";
import { getUserName, saveUserName } from "../../services/user-service";

const Login: React.FC = () => {
  const [privateKey, setPrivateKey] = useState("");
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async () => {
    if (!privateKey.trim()) return;

    try {
      setIsLoading(true);
      const web3: Web3 = Web3Service.getInstance().getWeb3();
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const balance = await web3.eth.getBalance(account.address);
      const nonce = await web3.eth.getTransactionCount(account.address);

      const userName = await getUserName(account.address.toLowerCase());

      if (!userName) {
        setIsModalOpen(true);
        return;
      }

      completeLogin(
        account.address,
        web3,
        balance.toString(),
        Number(nonce),
        userName
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
    const web3: Web3 = Web3Service.getInstance().getWeb3();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const balance = await web3.eth.getBalance(account.address);
    const nonce = await web3.eth.getTransactionCount(account.address);

    await saveUserName(account.address, userName);

    completeLogin(
      account.address,
      web3,
      balance.toString(),
      Number(nonce),
      userName
    );

    setIsModalOpen(false);
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

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.05 } }),
  };

  const title = "Life-changing care for anxiety, depression".split("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus(); // Focus the input when modal opens
    }
  }, [isModalOpen]);

  return (
    <motion.div
      className="flex min-h-screen flex-col py-20 items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      style={{
        backgroundImage: `
        url('https://www.brightside.com/wp-content/uploads/2024/10/homepage-hero-background.png'),
        linear-gradient(270deg, #d8f7f9 0.12%, #eaf8f8 49.98%)
      `,
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

          <ul className="pl-6 mb-12">
            <motion.li
              initial={{ opacity: 0, x: -150 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="relative pl-[5px] pt-[2px] pb-[6px] first:font-normal first:text-[16px] first:leading-[24px] first:text-[#5e6883] before:content-[''] before:absolute before:top-[7px] before:left-[-24px] before:w-[16px] before:h-[16px] before:bg-no-repeat before:bg-[url('https://cdn-bdbem.nitrocdn.com/yrwSkDRCUsSJojtHYJfOKApBTqtWkGlN/assets/images/optimized/rev-8f85b25/www.brightside.com/wp-content/themes/brightside-v4/assets/checkmark-aqua-no-bg.svg')]"
            >
              Treatment for ages 13+
            </motion.li>
          </ul>

          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form action="" className="max-w-full flex flex-wrap items-center">
              <motion.label
                className="flex-[1_1_100%] text-[#2e4985] font-outfit font-semibold text-[20px] leading-[26px] mb-[12px]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                How can we help you today?
              </motion.label>

              <div className="flex items-center gap-3">
                <motion.input
                  type="password"
                  placeholder="Enter Private Key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="flex-[1_1_72%] text-[16px] p-[12px] rounded-lg border-2 border-[#ccd1db] bg-white"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />

                <motion.button
                  onClick={handleLogin}
                  className={`flex-[1_1_25%] min-w-[145px] ml-[3%] bg-[#2e4985] font-outfit font-bold text-[14px] tracking-[2.4px] text-white p-[20px_24px] rounded-[40px] border-0 uppercase transition ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isLoading}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  {isLoading ? "Đang đăng nhập..." : "go"}
                </motion.button>
              </div>

              {error && (
                <motion.p
                  className="text-red-500 text-center mt-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-bold mb-4">Name Your Address</h2>
        <input
          type="text"
          ref={inputRef}
          placeholder="Enter a name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleSaveName}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Name
        </button>
      </Modal>
    </motion.div>
  );
};

export default Login;
