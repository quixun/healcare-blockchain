import { useState, useMemo } from "react"; // 1. Import useMemo
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RootState } from "../../features/store";
import { contractAddress, ACCESS_CONTROL_ABI } from "./configs/contract";
import { ROUTES } from "@/Router/routes";

const GrantRevokeAccess = ({ recordId }: { recordId: string }) => {
  const [loading, setLoading] = useState(false);
  const { address: account } = useSelector((state: RootState) => state.account);
  const navigate = useNavigate();

  const formSchema = useMemo(() => {
    return z.object({
      address: z
        .string()
        .min(1, "Address is required")
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
        .refine(
          (val) => val.toLowerCase() !== account?.toLowerCase(),
          "You cannot grant or revoke access to your own wallet"
        ),
      duration: z.string().optional(),
    });
  }, [account]);

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      duration: "",
    },
    mode: "onChange",
  });

  const getContract = async () => {
    if (!account) throw new Error("Wallet not connected");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(account);
    return new ethers.Contract(contractAddress, ACCESS_CONTROL_ABI, signer);
  };

  const onGrant = async (data: FormData) => {
    const durationVal = parseInt(data.duration || "0", 10);
    if (!data.duration || isNaN(durationVal) || durationVal <= 0) {
      setError("duration", {
        type: "manual",
        message: "Valid duration (seconds) is required for granting access",
      });
      return;
    }

    const promise = async () => {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.grantAccess(
        recordId,
        data.address,
        durationVal
      );
      await tx.wait();
      navigate(ROUTES.RECORD);
      return `Access granted to ${data.address.slice(
        0,
        6
      )}... for ${durationVal}s`;
    };

    toast.promise(promise(), {
      loading: "Granting access... Check your wallet",
      success: (msg) => msg,
      error: (err) => {
        console.error(err);
        return err.reason || "Failed to grant access. Check console.";
      },
      finally: () => setLoading(false),
    });
  };

  const onRevoke = async () => {
    // Only trigger validation for the address field
    const isAddressValid = await trigger("address");
    if (!isAddressValid) return;

    const address = getValues("address");

    const promise = async () => {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.revokeAccess(recordId, address);
      await tx.wait();
      return `Access revoked for ${address.slice(0, 6)}...`;
    };

    toast.promise(promise(), {
      loading: "Revoking access... Check your wallet",
      success: (msg) => msg,
      error: (err) => {
        console.error(err);
        return err.reason || "Failed to revoke access. Check console.";
      },
      finally: () => setLoading(false),
    });
  };

  return (
    <motion.div
      className="p-6 border rounded-lg shadow-md bg-white max-w-md mx-auto"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Manage Record Access
      </h2>

      <form className="flex flex-col gap-4">
        {/* Address Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Wallet Address
          </label>
          <input
            {...register("address")}
            type="text"
            placeholder="0x..."
            className={`border p-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.address
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {errors.address && (
            <span className="text-xs text-red-500">
              {errors.address.message}
            </span>
          )}
        </div>

        {/* Duration Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Duration{" "}
            <span className="text-gray-400 font-normal">(seconds)</span>
          </label>
          <input
            {...register("duration")}
            type="number"
            placeholder="e.g. 3600"
            className={`border p-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.duration
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {errors.duration && (
            <span className="text-xs text-red-500">
              {errors.duration.message}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleSubmit(onGrant)}
            type="button"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Grant Access
          </button>

          <button
            onClick={onRevoke}
            type="button"
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revoke Access
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default GrantRevokeAccess;
