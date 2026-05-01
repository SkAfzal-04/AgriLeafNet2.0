import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function Login() {
  const navigate = useNavigate();
 
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [toast, setToast] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [lang, setLang] = useState("en");
 
  // 🌐 TEXT
  const text = {
    en: {
      title: "Login",
      name: "Enter your name",
      phone: "Enter phone number",
      send: "Send OTP",
      otp: "Enter OTP",
      verify: "Verify OTP",
      fill: "Please fill all fields",
      invalid: "Invalid OTP",
      success: "Login successful",
      enterOtp: "Enter OTP",
      error: "Server error"
    },
    hi: {
      title: "लॉगिन",
      name: "अपना नाम दर्ज करें",
      phone: "फोन नंबर दर्ज करें",
      send: "OTP भेजें",
      otp: "OTP दर्ज करें",
      verify: "OTP सत्यापित करें",
      fill: "सभी फ़ील्ड भरें",
      invalid: "गलत OTP",
      success: "सफल लॉगिन",
      enterOtp: "OTP दर्ज करें",
      error: "सर्वर त्रुटि"
    },
    bn: {
      title: "লগইন",
      name: "আপনার নাম লিখুন",
      phone: "ফোন নম্বর লিখুন",
      send: "OTP পাঠান",
      otp: "OTP লিখুন",
      verify: "OTP যাচাই করুন",
      fill: "সব তথ্য পূরণ করুন",
      invalid: "ভুল OTP",
      success: "লগইন সফল",
      enterOtp: "OTP লিখুন",
      error: "সার্ভার ত্রুটি"
    }
  };
 
  const t = text[lang];
 
  // 🔔 Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };
 
  // 📱 SEND OTP
  const sendOtp = async () => {
    try {
      if (!name || !phone) {
        showToast(t.fill);
        return;
      }
 
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });
 
      const data = await res.json();
      console.log("OTP RESPONSE:", data);
 
      if (data.otp) {
        setShowOtpInput(true);
 
        // ✅ show both ways
        setOtpMessage(`OTP sent: ${data.otp}`);
        showToast(`OTP sent: ${data.otp}`);
 
      } else {
        showToast("Failed to get OTP");
      }
 
    } catch {
      showToast(t.error);
    }
  };
 
  // 🔐 VERIFY OTP
  const verifyOtp = async () => {
    try {
      if (!otp) {
        showToast(t.enterOtp);
        return;
      }
 
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp })
      });
 
      const data = await res.json();
      console.log("VERIFY:", data);
 
      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("lang", lang);
 
        showToast(t.success);
        navigate("/detector");
 
      } else {
        showToast(data.msg || t.invalid);
      }
 
    } catch {
      showToast("Verification error");
    }
  };
 
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
 
      {toast && (
  <div className="fixed top-6 right-6 z-[9999] bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl text-base font-semibold min-w-[250px]">
    {toast}
  </div>
)}
      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-[350px]"
      >
 
        {/* LANGUAGE */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="mb-4 border p-1 rounded text-sm"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="bn">বাংলা</option>
        </select>
 
        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          {t.title}
        </h2>
 
        {/* NAME */}
        <input
          type="text"
          placeholder={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />
 
        {/* PHONE */}
        <input
          type="text"
          placeholder={t.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />
 
        {/* SEND OTP */}
        <button
          onClick={sendOtp}
          className="w-full bg-green-600 text-white py-2 rounded mb-2 hover:bg-green-700 transition"
        >
          {t.send}
        </button>
 
        {/* 🔔 OTP MESSAGE (inside card) */}
        {otpMessage && (
          <p className="text-sm text-gray-600 text-center mb-3">
            {otpMessage}
          </p>
        )}
 
        {/* OTP SECTION */}
        {showOtpInput && (
          <>
            <input
              type="text"
              placeholder={t.otp}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 p-2 mb-3 rounded focus:ring-2 focus:ring-green-400"
            />
 
            <button
              onClick={verifyOtp}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {t.verify}
            </button>
          </>
        )}
 
      </motion.div>
    </div>
  );
}