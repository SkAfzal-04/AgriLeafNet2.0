import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import About from "./pages/About";
import Detector from "./pages/Detector";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

export default function App() {
  return (
    <BrowserRouter>

      {/* 🔥 TOAST */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "500",
            padding: "14px 16px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.08)",
          },
        }}
      />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/detector" element={<Detector />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Chatbot />

      <Footer />
    </BrowserRouter>
  );
}