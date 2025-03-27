import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { saveUserInfo, getUserInfo, Gender } from "../../services/user-service";

const genderMap = {
  [Gender.MALE]: "Nam",
  [Gender.FEMALE]: "Nữ",
  [Gender.OTHER]: "Khác",
};

const Home: React.FC = () => {
  const { address, balance, nonce } = useSelector(
    (state: RootState) => state.account
  );

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

  const handleUpdateProfile = async () => {
    if (!address) return setMessage("Bạn chưa đăng nhập");

    try {
      setLoading(true);
      await saveUserInfo(address, userInfo);
      setMessage("Cập nhật thông tin thành công!");
      setEditMode(false);
      fetchUserInfo();

      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 3000);
    } catch (error) {
      setMessage(`Có lỗi xảy ra khi cập nhật thông tin,${error}`);
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

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        handleChange("avatarUrl", imageUrl);
      }
      e.target.value = "";
    },
    [handleChange]
  );

  const maskedAddress = useMemo(() => {
    return address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "Chưa đăng nhập";
  }, [address]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 ${
        editMode && "mt-20"
      }`}
    >
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Thông Tin Cá Nhân
        </h2>

        {userInfo.avatarUrl && (
          <img
            src={userInfo.avatarUrl}
            alt="Avatar"
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
        )}

        {message && (
          <p
            className={`text-green-600 mb-4 transition-opacity duration-1000 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            {message}
          </p>
        )}

        {editMode ? (
          <>
            {Object.entries(userInfo).map(
              ([key, value]) =>
                key !== "avatarUrl" && (
                  <div className="mb-4 text-left" key={key}>
                    <label className="block font-medium">
                      {key === "userName"
                        ? "Tên chủ sở hữu:"
                        : key === "bio"
                        ? "Giới thiệu:"
                        : key === "email"
                        ? "Email:"
                        : key === "phoneNumber"
                        ? "Số điện thoại:"
                        : key === "dateOfBirth"
                        ? "Ngày sinh:"
                        : key === "gender"
                        ? "Giới tính:"
                        : key === "location"
                        ? "Địa chỉ:"
                        : key === "occupation"
                        ? "Nghề nghiệp:"
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
              <label className="block font-medium">Ảnh đại diện:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
            >
              {loading ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </>
        ) : (
          <div className="text-left">
            <p className="text-gray-600">
              <strong>Tên chủ sở hữu:</strong>{" "}
              {userInfo.userName || "Chưa đăng nhập"}
            </p>
            <p className="text-gray-600">
              <strong>Địa chỉ ví:</strong> {maskedAddress}
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> {userInfo.email || "Chưa cập nhật"}
            </p>
            <p className="text-gray-600">
              <strong>Số điện thoại:</strong>{" "}
              {userInfo.phoneNumber || "Chưa cập nhật"}
            </p>
            <p className="text-gray-600">
              <strong>Số dư:</strong> {balance || "Chưa cập nhật"}
            </p>
            <p className="text-gray-600">
              <strong>Số lượng giao dịch:</strong> {nonce || "Chưa cập nhật"}
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full"
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
