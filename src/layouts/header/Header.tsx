import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router";
import { logout } from "../../features/account/accountSlice";
import { useAppSelector } from "../../features/hooks";
import { RootState } from "../../features/store";
import { SquareUserRound, History, Banknote, ImageUp, Bot, ListVideo, Menu, X } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { label: "Tải ảnh lên", icon: <ImageUp />, path: "/transfer-image" },
  { label: "Tất cả ảnh", icon: <ListVideo />, path: "/image-list" },
  { label: "Chuyển tiền", icon: <Banknote />, path: "/transfer" },
  { label: "Trò chuyện với bác sĩ", icon: <Bot />, path: "/chat-ai" },
  { label: "Lịch sử chuyển tiền", icon: <History />, path: "/transactions" },
  { label: "Thông tin cá nhân", icon: <SquareUserRound />, path: "/" },
];

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useAppSelector((state: RootState) => state.account);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMouseEnter = (text: string) => {
    const newTimer = setTimeout(() => {
      setTooltip(text);
    }, 200);
    setTimer(newTimer);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setTooltip(null);
  };

  return (
    <>
      <header className="bg-blue-600 z-50 fixed top-0 w-full text-white py-4 px-6 shadow-md flex justify-between items-center">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Health care
        </h1>

        {status ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 relative">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  <button
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                    disabled={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-lg transition ${
                      location.pathname === item.path
                        ? "bg-blue-800 text-white"
                        : "bg-white text-blue-600 hover:bg-gray-200 cursor-pointer"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {item.icon}
                  </button>

                  {tooltip === item.label && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-12 left-1/2 -translate-x-1/2 text-sm bg-gray-800 text-white p-2 rounded-lg"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              ))}
              <button
                className="bg-red-500 px-4 cursor-pointer py-2 rounded-lg hover:bg-red-700 transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="block md:hidden bg-white text-blue-600 p-2 rounded-lg hover:bg-gray-200 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 right-6 bg-white text-blue-600 rounded-lg shadow-lg p-4 flex flex-col space-y-2 md:hidden"
              >
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-700 transition"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <button
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        )}
      </header>
      <Outlet />
    </>
  );
};

export default Header;
