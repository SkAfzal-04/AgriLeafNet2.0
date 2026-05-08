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

  useEffect(() => {
    const handleStorage = () => {
      setLang(localStorage.getItem("lang") || "en");
    };

    // Detect changes from same tab
    window.addEventListener("languageChanged", handleStorage);

    // Detect changes from other tabs
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "languageChanged",
        handleStorage
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // 🌍 Multi-language UI
  const ui = {
    en: {
      home: "Home",
      about: "About",
      detect: "Start Detection",
      login: "Login",
      logout: "Logout",
      logoutMsg: "Logged out successfully",
      loginRequired: "Please sign in first to access disease detection.",
      supported: "Supported",
      sessionMsg: "This will end your session.",
      confirmLogout: "Are you sure you want to logout?",
      cancel: "Cancel",
      confirm: "Yes, Logout",
    },

    hi: {
      home: "होम",
      about: "परिचय",
      detect: "जांच शुरू करें",
      login: "लॉगिन",
      logout: "लॉगआउट",
      logoutMsg: "सफलतापूर्वक लॉगआउट किया गया",
      loginRequired: "रोग पहचान सुविधा उपयोग करने के लिए पहले लॉगिन करें।",
      supported: "समर्थित",
      sessionMsg: "इससे आपका सत्र समाप्त हो जाएगा।",
      confirmLogout: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
      cancel: "रद्द करें",
      confirm: "हाँ, लॉगआउट",
    },

    bn: {
      home: "হোম",
      about: "সম্পর্কে",
      detect: "সনাক্তকরণ শুরু করুন",
      login: "লগইন",
      logout: "লগআউট",
      logoutMsg: "সফলভাবে লগআউট হয়েছে",
      loginRequired: "রোগ শনাক্তকরণ ব্যবহারের জন্য আগে লগইন করুন।",
      supported: "সমর্থিত",
      sessionMsg: "এটি আপনার সেশন শেষ করবে।",
      confirmLogout: "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?",
      cancel: "বাতিল",
      confirm: "হ্যাঁ, লগআউট",
    },

    ta: {
      home: "முகப்பு",
      about: "எங்களை பற்றி",
      detect: "கண்டறிதலை தொடங்கு",
      login: "உள்நுழை",
      logout: "வெளியேறு",
      logoutMsg: "வெற்றிகரமாக வெளியேறப்பட்டது",
      loginRequired: "நோய் கண்டறிதலை பயன்படுத்த முதலில் உள்நுழைக.",
      supported: "ஆதரிக்கப்பட்டது",
      sessionMsg: "இது உங்கள் அமர்வை முடிக்கும்.",
      confirmLogout: "நீங்கள் வெளியேற விரும்புகிறீர்களா?",
      cancel: "ரத்து",
      confirm: "ஆம், வெளியேறு",
    },

    te: {
      home: "హోమ్",
      about: "గురించి",
      detect: "గుర్తింపు ప్రారంభించండి",
      login: "లాగిన్",
      logout: "లాగౌట్",
      logoutMsg: "విజయవంతంగా లాగౌట్ అయ్యారు",
      loginRequired: "వ్యాధి గుర్తింపును ఉపయోగించడానికి ముందుగా లాగిన్ చేయండి.",
      supported: "మద్దతు ఇవ్వబడింది",
      sessionMsg: "ఇది మీ సెషన్‌ను ముగిస్తుంది.",
      confirmLogout: "మీరు నిజంగా లాగౌట్ కావాలా?",
      cancel: "రద్దు",
      confirm: "అవును, లాగౌట్",
    },
  };
  const t = ui[lang] || ui.en;

  // 🔒 Protect Detector Page
  const handleDetect = () => {
    if (!user) {
      toast.error(t.loginRequired);
      navigate("/login");
      return;
    }

    navigate("/detector");
  };

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("user_id");

    toast.success(t.logoutMsg);

    setShowLogoutModal(false);
    setOpen(false);

    navigate("/");
  };
  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showLogoutModal]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/20 bg-white/75 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">

          {/* 🌿 Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-green-100 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="AgriLeafNet Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                AgriLeafNet
              </h1>

              <p className="text-xs text-gray-500">
                AI Agriculture Platform
              </p>
            </div>
          </div>

          {/* 🌍 Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              {t.home}
            </button>

            <button
              onClick={() => navigate("/about")}
              className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              {t.about}
            </button>

            {/* 🌱 Detect */}
            <button
              onClick={handleDetect}
              className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
            >
              {t.detect}
            </button>

            {/* 🔐 Login / Logout */}
            {user ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all duration-200"
              >
                {t.logout}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-xl border border-green-200 text-green-700 font-semibold hover:bg-green-50 transition-all duration-200"
              >
                {t.login}
              </button>
            )}

          </div>

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-700"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 📱 Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg">

            <div className="px-6 py-5 flex flex-col gap-3">

              <button
                onClick={() => {
                  navigate("/");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition"
              >
                {t.home}
              </button>

              <button
                onClick={() => {
                  navigate("/about");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition"
              >
                {t.about}
              </button>

              <button
                onClick={() => {
                  handleDetect();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
              >
                {t.detect}
              </button>

              {user ? (
                <button
                  onClick={() => {
                    setShowLogoutModal(true)
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                >
                  {t.logout}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-green-200 text-green-700 font-semibold hover:bg-green-50 transition"
                >
                  {t.login}
                </button>
              )}

              {/* 🌍 Supported Languages */}
              <div className="mt-2 px-2 text-sm text-gray-500">
                {t.supported}: English • বাংলা • हिंदी • தமிழ் • తెలుగు
              </div>

            </div>
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
              {t.sessionMsg}
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