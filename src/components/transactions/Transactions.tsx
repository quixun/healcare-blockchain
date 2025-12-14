import { useCallback, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SquareArrowDownRight, SquareArrowUpLeft, Search } from "lucide-react";
import Web3Service from "../../services/web3Service";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { getUserName } from "../../services/user-service";
import Web3 from "web3";

interface Transaction {
  from: string;
  to: string;
  value: bigint;
  hash: string;
  input: string;
  timestamp?: number;
}

const decodeMessage = (input: string, web3: Web3) => {
  if (input && input !== "0x") {
    try {
      return web3.utils.hexToUtf8(input);
    } catch {
      return "Can not decript.";
    }
  }
  return "There are not any message.";
};

const formatTimestamp = (timestamp?: number) =>
  timestamp
    ? new Date(timestamp * 1000).toLocaleString()
    : "Unknown time";

const formatDate = (timestamp?: number) =>
  timestamp ? new Date(timestamp * 1000).toLocaleDateString() : "Unknown date";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const { address } = useSelector((state: RootState) => state.account);
  const web3 = Web3Service.getInstance().getWeb3();
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const getTransactionsByAddress = useCallback(
    async (address: string) => {
      const latestBlock = await web3.eth.getBlockNumber();
      const blockPromises = Array.from(
        { length: Math.min(51, Number(latestBlock) + 1) },
        (_, i) => web3.eth.getBlock(Number(latestBlock) - i, true)
      );

      const blocks = await Promise.all(blockPromises);

      const txs: Transaction[] = blocks.flatMap(
        (block) =>
          block?.transactions
            .filter(
              (tx): tx is Transaction =>
                typeof tx === "object" &&
                (tx.from.toLowerCase() === address.toLowerCase() ||
                  tx.to?.toLowerCase() === address.toLowerCase())
            )
            .map((tx) => ({ ...tx, timestamp: Number(block.timestamp) }))
            .filter((tx) => {
              try {
                const decodedInput = web3.utils.hexToUtf8(tx.input);
                return !decodedInput.startsWith("IMG:") && !decodedInput.startsWith("Product:");
              } catch {
                return true;
              }
            })
            .filter((tx) => BigInt(tx.value) > 0n) || []
      );

      return txs;
    },
    [web3.eth, web3.utils]
  );

  const fetchUserNames = useCallback(
    async (txs: Transaction[]) => {
      const uniqueAddresses = new Set(
        txs.flatMap((tx) => [tx.from.toLowerCase(), tx.to?.toLowerCase()])
      );

      const addressList = Array.from(uniqueAddresses).filter(
        (addr) => addr && !userNames[addr]
      );

      if (addressList.length === 0) return;

      const results = await Promise.allSettled(
        addressList.map((addr) => getUserName(addr))
      );

      const nameMap = addressList.reduce((acc, addr, idx) => {
        if (results[idx].status === "fulfilled" && results[idx].value) {
          acc[addr] = results[idx].value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (Object.keys(nameMap).length > 0) {
        setUserNames((prev) => ({ ...prev, ...nameMap }));
      }
    },
    [userNames]
  );

  useEffect(() => {
    if (!address) return;

    const fetchTransactions = async () => {
      const txs = await getTransactionsByAddress(address);
      setTransactions(txs);
      fetchUserNames(txs);
    };

    fetchTransactions();
  }, [address, fetchUserNames, getTransactionsByAddress]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const lowerQuery = searchQuery.toLowerCase();

    return transactions.filter((tx) => {
      const message = decodeMessage(tx.input, web3).toLowerCase();
      return message.includes(lowerQuery);
    });
  }, [transactions, searchQuery, web3]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const date = formatDate(tx.timestamp);
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  return (
    <div className="my-20">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative h-full px-9 pt-16 rounded-lg z-30 w-full p-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: -300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transaction History
          </motion.h2>

          <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by message content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition duration-150 ease-in-out"
            />
          </div>

          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="my-5">
                <h3 className="text-2xl font-semibold mb-4">{date}</h3>
                {txs.map((tx) => {
                  const isSent =
                    tx.from.toLowerCase() === address?.toLowerCase();
                  const amount = `${isSent ? "-" : "+"}${web3.utils.fromWei(
                    tx.value.toString(),
                    "ether"
                  )} ETH`;
                  const userDisplayName = isSent
                    ? userNames[tx.to ?? ""] || tx.to
                    : "Transfer money";

                  return (
                    <motion.div
                      key={tx.hash}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-5 border max-h-[550px] overflow-y-scroll my-4 cursor-pointer border-gray-200 shadow-lg rounded-2xl bg-white flex items-center overflow-hidden"
                    >
                      <div className="mr-4">
                        {isSent ? (
                          <SquareArrowUpLeft className="text-red-500 w-8 h-8" />
                        ) : (
                          <SquareArrowDownRight className="text-green-500 w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-1 line-clamp-4 pr-4 overflow-hidden">
                        <p className="text-xl font-semibold">
                          {userDisplayName}
                        </p>
                        <p className="text-gray-500">
                          {decodeMessage(tx.input, web3)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>
                      <p
                        className={`text-xl ${
                          isSent ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {amount}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ))
          ) : (
            <motion.div
              className="text-center text-gray-500 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              {searchQuery ? (
                <p>No messages found matching "{searchQuery}"</p>
              ) : (
                <p>No transactions available.</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;