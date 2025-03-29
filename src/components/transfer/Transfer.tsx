import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import Web3Service from "../../services/web3Service";
import { useAppDispatch } from "../../features/hooks";
import { updateAcount } from "../../features/account/accountSlice";
import Modal from "../common/modal";

const Transfer: React.FC = () => {
  const { address } = useSelector((state: RootState) => state.account);
  const dispatch = useAppDispatch();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const web3 = Web3Service.getInstance().getWeb3();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSendClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSend = () => {
    setIsModalOpen(false);
    handleTransfer();
  };

  const handleTransfer = async () => {
    try {
      if (!address) {
        setMessage("Bạn chưa đăng nhập.");
        return;
      }

      if (!web3.utils.isAddress(recipient)) {
        setMessage("Địa chỉ ví không hợp lệ.");
        return;
      }
      // Validate amount: must be a positive number greater than 0
      if (!/^\d*\.?\d+$/.test(amount) || parseFloat(amount) <= 0) {
        setMessage("Số tiền không hợp lệ. Vui lòng nhập số dương.");
        return;
      }

      setLoading(true);
      setMessage("");

      const encodedMessage = web3.utils.utf8ToHex(transferMessage);

      await web3.eth.sendTransaction({
        from: address,
        to: recipient,
        value: web3.utils.toWei(amount, "ether"),
        data: encodedMessage,
      });

      const balance = await web3.eth.getBalance(address);
      const nonce = await web3.eth.getTransactionCount(address);

      dispatch(
        updateAcount({
          balance: web3.utils.fromWei(balance, "ether"),
          nonce: nonce.toString(),
        })
      );

      setMessage("Chuyển tiền thành công!");
      setRecipient("");
      setAmount("");
      setTransferMessage("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Giao dịch thất bại: " + error.message);
      } else {
        setMessage("Giao dịch thất bại: Lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-40 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Chuyển tiền</h2>
      {message && <p className="text-red-500 text-center">{message}</p>}
      <div className="mb-4">
        <label className="block font-medium">Địa chỉ ví nhận:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Số tiền (ETH):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Thông tin chuyển tiền:</label>
        <input
          type="text"
          value={transferMessage}
          onChange={(e) => setTransferMessage(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>
      <button
        onClick={handleSendClick}
        disabled={loading}
        className="w-full ease-in-out duration-200 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Đang gửi..." : "Gửi tiền"}
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Xác nhận gửi tiền"
      >
        <p>Bạn có chắc chắn muốn gửi tiền không?</p>

        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="hover:bg-gray-200 ease-in-out duration-200 cursor-pointer bg-gray-300 px-4 py-2 rounded-lg"
          >
            Hủy
          </button>

          <button
            onClick={handleConfirmSend}
            className="hover:bg-green-400 ease-in-out duration-200 cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Xác nhận
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Transfer;
