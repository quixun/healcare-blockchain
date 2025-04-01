import { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { motion } from "motion/react";

const WEB3_RPC_URL = import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL;

const fetchAllPublicCIDs = async () => {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_RPC_URL));
    const latestBlock = await web3.eth.getBlockNumber();
    const cids: { cid: string; owner: string }[] = [];

    for (
      let i = latestBlock;
      i >= Math.max(0, Number(latestBlock) - 1000);
      i--
    ) {
      const block = await web3.eth.getBlock(i, true);

      if (block && block.transactions) {
        block.transactions.forEach((tx) => {
          if (typeof tx === "object" && tx.input && tx.input !== "0x") {
            try {
              const decodedInput = web3.utils.hexToUtf8(tx.input);
              if (decodedInput.startsWith("IMG:")) {
                const cid = decodedInput.replace("IMG:", "").trim();
                cids.push({ cid, owner: tx.from });
              }
            } catch {
              return [];
            }
          }
        });
      }
    }

    return cids;
  } catch {
    return [];
  }
};

const PublicCIDList: React.FC = () => {
  const [cids, setCIDs] = useState<{ cid: string; owner: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const { address } = useSelector((state: RootState) => state.account);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllPublicCIDs();
      setCIDs(data);
      setCurrentUser(address?.toLowerCase() || null);
    };

    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      fetchData();
    }
  }, [address]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 mt-20 bg-white shadow-md rounded-lg"
    >
      <h2 className="text-lg font-semibold mb-3">
        Public Images on Civic Blockchain
      </h2>

      {cids.length === 0 ? (
        <p className="text-gray-500">No images found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cids.map(({ cid, owner }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`p-2 rounded-lg shadow-sm relative ${
                currentUser && owner.toLowerCase() === currentUser
                  ? "border-4 border-blue-500 bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              {currentUser && owner.toLowerCase() === currentUser && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute z-10 top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded"
                >
                  Your Image
                </motion.span>
              )}

              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.img
                  src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${cid}`}
                  alt={`IPFS Image ${index}`}
                  className="w-full h-48 object-contain rounded-lg"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </a>

              <p className="text-xs text-gray-600 mt-1">Uploaded by: {owner}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PublicCIDList;
