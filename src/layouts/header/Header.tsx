import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router";
import { logout } from "../../features/account/accountSlice";
import { useAppSelector } from "../../features/hooks";
import { RootState } from "../../features/store";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type NavItem = {
  label: string;
  path?: string;
  subItems?: NavItem[];
};

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about-us" },
  {
    label: "Services",
    subItems: [
      { label: "Medicines", path: "/services/medicines" },
      { label: "Record", path: "/services/record" },
    ],
  },
  {
    label: "Pages",
    subItems: [
      { label: "Upload Record", path: "/transfer-image" },
      { label: "Transfer Money", path: "/transfer" },
      { label: "Chat with AI", path: "/chat-ai" },
      { label: "Transaction History", path: "/transactions" },
    ],
  },
  { label: "Account", path: "/account" },
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
      <header className="bg-white z-50 fixed top-0 w-full text-white py-4 px-6 flex justify-between items-center">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/images/logo.png"
            alt="logo"
            className="w-full h-10 bg-contain"
          />
        </h1>

        {status ? (
          <>
            <nav className="hidden lg:flex space-x-4 relative">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    disabled={location.pathname === item.path}
                    onClick={() => item.path && navigate(item.path)}
                    className={`px-3 py-2 rounded-lg transition flex items-center space-x-2 ${
                      location.pathname === item.path
                        ? "text-blue-600"
                        : "text-black hover:text-blue-600 cursor-pointer"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="uppercase">{item.label}</span>
                    {item.subItems && (
                      <span className="text-sm">
                        <ChevronDown />
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {tooltip === item.label && item.subItems && (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-full left-0 bg-white p-2 shadow-lg rounded-lg z-10 min-w-max"
                      >
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.label}
                            onClick={() =>
                              subItem.path && navigate(subItem.path)
                            }
                            className="block px-4 py-2 text-black hover:bg-gray-200 transition w-full text-left"
                          >
                            <span className="whitespace-nowrap">
                              {subItem.label}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
            <button
              className="block lg:hidden bg-white text-blue-600 p-2 rounded-lg hover:bg-gray-200 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.95,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-20 right-6 bg-white text-blue-600 rounded-lg shadow-lg p-4 flex flex-col space-y-2"
                >
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                        }
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
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
            </AnimatePresence>
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
