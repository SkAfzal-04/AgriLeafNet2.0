import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = localStorage.getItem("user_id");

  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "en"
  );

  // =========================
  // 🌍 LANGUAGE SYNC
  // =========================
  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };

    window.addEventListener("languageChanged", handleLangChange);
    window.addEventListener("storage", handleLangChange);

    return () => {
      window.removeEventListener("languageChanged", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  // =========================
  // 🌍 UI TEXT
  // =========================
  const ui = {
    en: {
      home: "Home",
      about: "About",
      detect: "Start Detection",
      login: "Login",
      logout: "Logout",
      logoutMsg: "Logged out successfully",
      loginRequired: "Please sign in first to access detection.",
      confirmLogout: "Are you sure you want to logout?",
      cancel: "Cancel",
      confirm: "Yes, Logout",
      supported: "Supported",
    },

    hi: {
      home: "होम",
      about: "परिचय",
      detect: "जांच शुरू करें",
      login: "लॉगिन",
      logout: "लॉगआउट",
      logoutMsg: "सफलतापूर्वक लॉगआउट किया गया",
      loginRequired: "पहले लॉगिन करें।",
      confirmLogout: "क्या आप लॉगआउट करना चाहते हैं?",
      cancel: "रद्द करें",
      confirm: "हाँ, लॉगआउट",
      supported: "समर्थित",
    },
  };

  const t = ui[lang] || ui.en;

  // =========================
  // 🔒 DETECT PROTECTION
  // =========================
  const handleDetect = () => {
    if (!user) {
      toast.error(t.loginRequired);
      navigate("/login");
      return;
    }

    navigate("/detector");
  };

  // =========================
  // 🚪 LOGOUT ACTION
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user_id");

    toast.success(t.logoutMsg);

    setShowLogoutModal(false);
    setOpen(false);

    navigate("/");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/20 bg-white/75 backdrop-blur-xl shadow-sm">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">

          {/* 🌿 LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700">
              A
            </div>

            <h1 className="text-xl font-bold text-gray-800">
              AgriLeafNet
            </h1>
          </div>

          {/* ================= DESKTOP MENU ================= */}
          <div className="hidden md:flex items-center gap-3">

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl hover:bg-green-50"
            >
              {t.home}
            </button>

            <button
              onClick={() => navigate("/about")}
              className="px-4 py-2 rounded-xl hover:bg-green-50"
            >
              {t.about}
            </button>

            <button
              onClick={handleDetect}
              className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              {t.detect}
            </button>

            {/* LOGIN / LOGOUT */}
            {user ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
              >
                {t.logout}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 rounded-xl border border-green-200 text-green-700 hover:bg-green-50"
              >
                {t.login}
              </button>
            )}
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {open && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-3">

            <button onClick={() => navigate("/")}>{t.home}</button>

            <button onClick={() => navigate("/about")}>{t.about}</button>

            <button onClick={handleDetect}>{t.detect}</button>

            {user ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-red-600"
              >
                {t.logout}
              </button>
            ) : (
              <button onClick={() => navigate("/login")}>
                {t.login}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

          <div className="bg-white w-[90%] max-w-sm p-6 rounded-2xl shadow-xl">

            <h2 className="text-lg font-semibold text-gray-800">
              {t.confirmLogout}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              This will end your session.
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl border"
              >
                {t.cancel}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                {t.confirm}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}