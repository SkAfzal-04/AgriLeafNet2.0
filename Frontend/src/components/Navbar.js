import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
 
  const user = localStorage.getItem("user_id");
  const lang = localStorage.getItem("lang") || "en";
 
  // 🌐 Multi-language messages
  const messages = {
    en: "Please login first to use detection.",
    hi: "कृपया पहले लॉगिन करें।",
    bn: "দয়া করে আগে লগইন করুন।",
    es: "Por favor inicia sesión primero.",
    fr: "Veuillez d'abord vous connecter.",
    de: "Bitte melden Sie sich zuerst an.",
    zh: "请先登录。"
  };
 
  // 🔒 Protect Detect Page
  const handleDetect = () => {
    if (!user) {
      alert(messages[lang]);
      navigate("/login");
    } else {
      navigate("/detector");
    }
  };
 
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
 
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/logo.png"
            alt="AgriLeafNet Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-extrabold text-green-700 tracking-wide">
            AgriLeafNet
          </h1>
        </div>
 
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center text-lg font-medium">
 
          <button
            onClick={() => navigate("/")}
            className="hover:text-green-600 transition"
          >
            Home
          </button>
 
          <button
            onClick={() => navigate("/about")}
            className="hover:text-green-600 transition"
          >
            About
          </button>
 
          {/* 🌱 DETECT BUTTON */}
          <button
            onClick={handleDetect}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Detect
          </button>
 
          {/* 🔐 LOGIN / LOGOUT */}
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("user_id");
                alert("Logged out");
                navigate("/");
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-white border border-green-600 text-green-700 px-3 py-1 rounded"
            >
              Login
            </button>
          )}
 
        </div>
 
        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-green-700"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
 
      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white/90 backdrop-blur-lg shadow-md px-6 py-4 space-y-3 text-lg">
 
          <button
            onClick={() => {
              navigate("/");
              setOpen(false);
            }}
            className="block w-full text-left hover:text-green-600"
          >
            Home
          </button>
 
          <button
            onClick={() => {
              navigate("/about");
              setOpen(false);
            }}
            className="block w-full text-left hover:text-green-600"
          >
            About
          </button>
 
          {/* 🌱 DETECT BUTTON */}
          <button
            onClick={() => {
              handleDetect();
              setOpen(false);
            }}
            className="block w-full text-left text-green-700 font-semibold"
          >
            Detect
          </button>
 
          {/* 🔐 LOGIN / LOGOUT */}
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("user_id");
                alert("Logged out");
                navigate("/");
                setOpen(false);
              }}
              className="block w-full text-left text-red-500"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setOpen(false);
              }}
              className="block w-full text-left text-green-700"
            >
              Login
            </button>
          )}
 
        </div>
      )}
    </nav>
  );
}