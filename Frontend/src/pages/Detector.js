import {   
  useState,
  useRef,
  useEffect,
  useCallback, } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  Camera,
  ShieldCheck,
  Activity,
  Languages,
  Sparkles,
} from "lucide-react";

import {
  translateDisease,
  translateType,
} from "../utils/disease_translator";
const BASE_URL =  process.env.REACT_APP_API_URL;

export default function Detector() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const navigate = useNavigate();

  // =========================
  // 🌿 HEALTH CHECK
  // =========================
  
  const isHealthy = (res) => {
    if (!res) return false;

    const disease = res.category?.toLowerCase();
    const type = res.type?.toLowerCase();

    return (
      disease?.includes("healthy") &&
      type?.includes("healthy")
    );
  };

    useEffect(() => {
  setTimeout(() => {
    const user = localStorage.getItem("user_id");
 
    console.log("USER IN DETECTOR:", user); // debug
 
    if (!user) {
      navigate("/login");
    }
  }, 200);
}, [navigate]);

  // =========================
  // 🌍 UI TEXT
  // =========================
  const uiText = {
    en: {
      title: "AgriLeafNet",
      subtitle:
        "AI Powered Potato Leaf Disease Detection System",
      upload: "Click to upload a potato leaf image",
      analyze: "Analyze Leaf",
      camera: "Capture using camera",
      disease: "Disease",
      type: "Disease Type",
      confidence: "Confidence",
      medicines: "Recommended Medicines",
      healthy:
        "Plant is healthy. No treatment required.",
      repeat: "Repeat every",
      days: "days",
    },

    bn: {
      title: "এগ্রিলিফনেট",
      upload: "ছবি আপলোড করুন",
      analyze: "বিশ্লেষণ করুন",
      camera: "ক্যামেরা",
      disease: "রোগ",
      type: "ধরণ",
      confidence: "নির্ভুলতা",
      medicines: "প্রস্তাবিত ওষুধ",
      healthy:
        "গাছ সুস্থ আছে। চিকিৎসার প্রয়োজন নেই।",
    },

    hi: {
      title: "एग्रीलीफनेट",
      upload: "छवि अपलोड करें",
      analyze: "विश्लेषण करें",
      camera: "कैमरा",
      disease: "रोग",
      type: "प्रकार",
      confidence: "सटीकता",
      medicines: "अनुशंसित दवाएं",
      healthy:
        "पौधा स्वस्थ है। उपचार की आवश्यकता नहीं है।",
    },

    ta: {
      title: "அக்ரிலீஃப்நெட்",
      upload: "படத்தை பதிவேற்றவும்",
      analyze: "பரிசோதிக்கவும்",
      camera: "கேமரா",
      disease: "நோய்",
      type: "வகை",
      confidence: "துல்லியம்",
      medicines: "பரிந்துரைக்கப்பட்ட மருந்துகள்",
      healthy:
        "தாவரம் ஆரோக்கியமாக உள்ளது.",
    },

    te: {
      title: "అగ్రిలీఫ్‌నెట్",
      upload: "చిత్రాన్ని అప్లోడ్ చేయండి",
      analyze: "విశ్లేషించండి",
      camera: "కెమెరా",
      disease: "వ్యాధి",
      type: "రకం",
      confidence: "ఖచ్చితత్వం",
      medicines: "సిఫార్సు చేసిన మందులు",
      healthy:
        "మొక్క ఆరోగ్యంగా ఉంది.",
    },
  };

  // =========================
  // 🌍 LANGUAGE LIST
  // =========================
  const languages = [
    { code: "en", label: "English" },
    { code: "bn", label: "বাংলা" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
  ];

  // =========================
  // 📁 FILE
  // =========================
  const handleFileChange = (e) => {
    const f = e.target.files[0];

    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  // =========================
  // 📷 CAMERA
  // =========================
  const startCamera = async () => {
    try {
      setCameraOn(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      videoRef.current.srcObject = stream;
    } catch {
      alert("Camera permission denied");
      setCameraOn(false);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas
      .getContext("2d")
      .drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const f = new File([blob], "capture.jpg");

      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    });

    video.srcObject
      .getTracks()
      .forEach((t) => t.stop());

    setCameraOn(false);
  };

  // =========================
  // 💊 FETCH MEDICINES
  // =========================
 const fetchMedicines = useCallback(async (disease) => {
  if (isHealthy(result)) return;

  try {
    const res = await axios.get(
      `${BASE_URL}/medicines`,
      {
        params: {
          disease,
          lang,
        },
      }
    );

    setResult((prev) => ({
      ...prev,
      medicines: res.data.medicines || [],
      warning: res.data.warning || null,
    }));
  } catch (err) {
    console.error(err);
  }
}, [lang, result]);

  // =========================
  // 🌍 LANGUAGE CHANGE
  // =========================
  useEffect(() => {
    if (
      result?.disease_name &&
      !isHealthy(result)
    ) {
      fetchMedicines(result.disease_name);
    }
  }, [lang,fetchMedicines,result]);

  // =========================
  // 🔍 PREDICT
  // =========================
  const handleUpload = async () => {
    if (!file) return alert("Upload image");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${BASE_URL}/predict`,
        formData
      );

      if (!res.data.is_leaf) {
        setResult({
          is_leaf: false,
          message: res.data.message,
        });

        return;
      }

      const prediction = res.data;

      const formatted = {
        is_leaf: true,
        category: prediction.category_prediction,
        type: prediction.disease_type_prediction,
        category_conf:
          prediction.category_confidence,
        type_conf:
          prediction.disease_type_confidence,
        disease_name: prediction.disease_name,
        medicines: [],
        warning: null,
      };

      setResult(formatted);

      if (!isHealthy(formatted)) {
        fetchMedicines(
          prediction.disease_name
        );
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const cleanDisease = (d) =>
    d
      ?.replace("Potato___", "")
      .replaceAll("_", " ");

  // =========================
  // 🎨 UI
  // =========================
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#dff6e7] via-[#ecfff1] to-[#d6f5de] flex justify-center items-center p-5 mt-14 overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-300/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-5xl backdrop-blur-xl bg-white/70 border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[36px] p-8 md:p-10">

        {/* HEADER */}
        <div className="flex justify-between items-start">

          {/* LANGUAGE */}
          <div className="relative w-fit">

            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition">

              {/* ICON */}
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-50">
                <Languages
                  size={18}
                  className="text-green-700"
                />
              </div>

              {/* CUSTOM DROPDOWN */}
              <div className="relative">

                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="
          appearance-none
          bg-transparent
          pl-1
          pr-10
          py-1
          rounded-xl
          text-sm sm:text-base
          font-medium
          text-gray-700
          outline-none
          cursor-pointer

          [&>option]:bg-white
          [&>option]:text-gray-700
        "
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                >
                  {languages.map((l) => (
                    <option
                      key={l.code}
                      value={l.code}
                    >
                      {l.label}
                    </option>
                  ))}
                </select>

                {/* CUSTOM ARROW */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>

                </div>
              </div>
            </div>
          </div>

          {/* AI BADGE */}
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-green-100">
            <Sparkles
              size={16}
              className="text-green-600"
            />
            <span className="text-sm font-medium text-gray-700">
              AI Powered
            </span>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mt-8">

          <div className="flex justify-center items-center gap-3">



            <h1 className="text-4xl p-2 font-black bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
              {uiText[lang].title}
            </h1>
          </div>

          <p className="mt-4 text-gray-600 text-md leading-relaxed">
            {uiText.en.subtitle}
          </p>
        </div>

        {/* UPLOAD AREA */}
        <label className="mt-10 mx-auto w-full max-w-[620px] group border-2 border-dashed border-green-300 hover:border-green-500 bg-gradient-to-br from-white to-green-50 rounded-[28px] px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:shadow-2xl">

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-5 rounded-3xl shadow-xl group-hover:scale-110 transition">
            <Upload
              size={24}
              className="text-white sm:w-[26px] sm:h-[26px]"
            />
          </div>

          <h3 className="mt-5 text-lg sm:text-2xl font-bold text-gray-800 leading-snug">
            {uiText[lang].upload}
          </h3>

          <p className="mt-2 text-sm sm:text-base text-gray-500">
            JPG, PNG, JPEG Supported
          </p>

          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </label>

        {/* CAMERA BUTTON */}
        <div className="flex justify-center mt-5">

          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border border-green-200 shadow-md hover:shadow-lg hover:scale-105 transition-all text-green-700 font-semibold text-sm sm:text-base"
          >
            <Camera size={16} />
            {uiText[lang].camera}
          </button>

        </div>

        {/* CAMERA */}
        {cameraOn && (
          <div className="mt-6 mx-auto w-full max-w-[620px]">

            <video
              ref={videoRef}
              autoPlay
              className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full h-[260px] sm:h-[380px] object-cover"
            />

            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">

              {/* CAPTURE */}
              <button
                onClick={captureImage}
                className="w-1/2 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-lg hover:scale-[1.02] transition"
              >
                Capture Image
              </button>

              {/* CLOSE */}
              <button
                onClick={() => {
                  videoRef.current?.srcObject
                    ?.getTracks()
                    .forEach((track) => track.stop());

                  setCameraOn(false);
                }}
                className="w-1/2 bg-white border border-red-200 text-red-600 py-3 sm:py-3.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-md hover:bg-red-50 transition"
              >
                Close Camera
              </button>

            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          hidden
        />

        {/* PREVIEW */}
        {preview && (
          <div className="mt-8 flex justify-center items-center">

            <div className="w-full max-w-[620px]">
              <img
                src={preview}
                alt="preview"
                className="rounded-3xl shadow-2xl border-4 border-white object-cover w-full max-h-[320px] sm:max-h-[380px]"
              />
            </div>

          </div>
        )}

        {/* ANALYZE BUTTON */}
        <button
          onClick={handleUpload}
          className="mt-7 w-full max-w-[620px] mx-auto flex justify-center items-center bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 hover:opacity-95 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg shadow-[0_15px_35px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.01]"
        >
          {loading ? (
            <div className="flex justify-center items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              <span className="text-sm sm:text-base">
                Analyzing Leaf...
              </span>
            </div>
          ) : (
            uiText[lang].analyze
          )}
        </button>
        {/* ERROR */}
        {result?.is_leaf === false && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-center shadow-sm">
            {result.message}
          </div>
        )}

        {/* RESULT */}
        {result?.is_leaf && (
          <div className="mt-8 bg-white/80 backdrop-blur-md border border-white rounded-[28px] p-6 shadow-xl">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-green-100 p-3 rounded-2xl">
                <Activity
                  className="text-green-700"
                  size={24}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Detection Report
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-sm text-gray-500">
                  {uiText[lang].disease}
                </p>

                <h3 className="mt-2 font-bold text-lg text-green-800">
                  {(
                    result.category?.toLowerCase().includes("healthy") &&
                      !result.type?.toLowerCase().includes("healthy")
                      ? translateType(result.type, lang)
                      : translateDisease(
                        cleanDisease(result.category),
                        lang
                      )
                  )
                    ?.charAt(0)
                    .toUpperCase() +
                    (
                      result.category?.toLowerCase().includes("healthy") &&
                        !result.type?.toLowerCase().includes("healthy")
                        ? translateType(result.type, lang)
                        : translateDisease(
                          cleanDisease(result.category),
                          lang
                        )
                    )?.slice(1)}
                </h3>
              </div>

              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-sm text-gray-500">
                  {uiText[lang].type}
                </p>

                <h3 className="mt-2 font-bold text-lg text-green-800">
                  {translateType(
                    result.type,
                    lang
                  )}
                </h3>
              </div>

              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-sm text-gray-500">
                  {uiText[lang].confidence}
                </p>

                <h3 className="mt-2 font-bold text-lg text-green-800">
                  {result.category_conf}%
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* HEALTHY */}
        {isHealthy(result) && (
          <div className="mt-6 flex items-center gap-3 bg-green-100 border border-green-200 text-green-700 p-5 rounded-2xl shadow-sm">

            <ShieldCheck size={24} />

            <p className="font-medium">
              {uiText[lang].healthy}
            </p>
          </div>
        )}

        {/* MEDICINES */}
        {!isHealthy(result) &&
          result?.medicines?.length > 0 && (

            <div className="mt-8 w-full mx-auto ">

              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                {uiText[lang].medicines}
              </h3>

              <div className="space-y-4">

                {result.medicines.map((m, i) => (

                  <div
                    key={i}
                    className="bg-green-100 border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all "
                  >

                    {/* MEDICINE NAME */}
                    <h4 className="text-base sm:text-lg font-bold text-black-800">
                      {m.name}
                    </h4>

                    {/* DOSE */}
                    {m.dose && (
                      <p className="mt-3 text-sm sm:text-base text-black-600 leading-relaxed">
                        {m.dose}
                      </p>
                    )}

                    {/* INTERVAL */}
                    {m.interval && (
                      <p className="mt-3 text-lg sm:text-md text-black-500 font-medium">
                        {uiText[lang].repeat} {m.interval} {uiText[lang].days}
                      </p>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}
        {/* WARNING */}
        {!isHealthy(result) &&
          result?.warning && (

            <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-5 shadow-sm">
              <p className="font-medium">
                ⚠️ {result.warning}
              </p>
            </div>
          )}
      </div>
    </section>
  );
}