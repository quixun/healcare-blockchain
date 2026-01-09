import { useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form"; // Added Controller
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RootState } from "../../features/store";
import { contractAddress, ACCESS_CONTROL_ABI } from "./configs/contract";
import { ROUTES } from "@/Router/routes";
import { getAllUsers, UserWithAddress } from "@/services/user-service";
import { DURATION_OPTIONS } from "@/constant/grant-time";

// Shadcn UI Imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ShieldCheck, UserPlus, Clock, CheckCircle2, Ban } from "lucide-react";

type GrantRevokeAccessProps = {
  major: string;
  recordId: string;
};

const GrantRevokeAccess = ({ recordId, major }: GrantRevokeAccessProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserWithAddress[]>([]);
  const { address: account } = useSelector((state: RootState) => state.account);
  const navigate = useNavigate();

  // --- LOGIC (Kept same as yours) ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const otherUsers = data.filter(
          (u) =>
            u.address.toLowerCase() !== account?.toLowerCase() &&
            u.major === major
        );
        setUsers(otherUsers);
      } catch (error) {
        console.error("Failed to load users", error);
        toast.error("Could not load user list");
      }
    };
    if (account) fetchUsers();
  }, [account, major]);

  const formSchema = useMemo(() => {
    return z.object({
      address: z.string().min(1, "Doctor address is required"),
      duration: z.string().min(1, "Duration is required"),
    });
  }, []);

  type FormData = z.infer<typeof formSchema>;

  const {
    control, // Use control for Shadcn components
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      duration: "",
    },
  });

  const getContract = async () => {
    if (!account) throw new Error("Wallet not connected");
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL);
    const signer = await provider.getSigner(account);
    return new ethers.Contract(contractAddress, ACCESS_CONTROL_ABI, signer);
  };

  const onGrant = async (data: FormData) => {
    const durationVal = parseInt(data.duration, 10);
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
      return `Access granted successfully`;
    };

    toast.promise(promise(), {
      loading: "Granting access...",
      success: (msg) => msg,
      error: (err) => err.reason || "Failed to grant access",
      finally: () => setLoading(false),
    });
  };

  const onRevoke = async () => {
    const isAddressValid = await trigger("address");
    if (!isAddressValid) return;
    const address = getValues("address");

    const promise = async () => {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.revokeAccess(recordId, address);
      await tx.wait();
      return `Access revoked`;
    };

    toast.promise(promise(), {
      loading: "Revoking access...",
      success: (msg) => msg,
      error: (err) => err.reason || "Failed to revoke access",
      finally: () => setLoading(false),
    });
  };

  return (
    <motion.div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Access Control
        </h2>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-col gap-4">
          {/* Doctor Selection with Shadcn */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Select Doctor ({major})
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={errors.address ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Choose a specialist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.address} value={user.address}>
                          Dr. {user.userName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No doctors found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.address && (
              <p className="text-xs text-red-500 font-medium">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Duration Selection with Shadcn */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Duration
            </label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={errors.duration ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select access time" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.duration && (
              <p className="text-xs text-red-500 font-medium">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSubmit(onGrant)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Grant
                </>
              )}
            </button>

            <button
              onClick={onRevoke}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" /> Revoke
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GrantRevokeAccess;
