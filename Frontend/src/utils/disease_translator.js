// ===========================================
// 🌿 DISEASE + TYPE TRANSLATIONS
// ===========================================

export const diseaseTranslations = {
  hi: {
    "Early blight": "अर्ली ब्लाइट",
    "Late blight": "लेट ब्लाइट",
    "healthy": "स्वस्थ"
  },
  bn: {
    "Early blight": "আর্লি ব্লাইট",
    "Late blight": "লেট ব্লাইট",
    "healthy": "সুস্থ"
  },
  ta: {
    "Early blight": "ஆர்லி ப்ளைட்",
    "Late blight": "லேட் ப்ளைட்",
    "healthy": "ஆரோக்கியம்"
  },
  te: {
    "Early blight": "ఎర్లీ బ్లైట్",
    "Late blight": "లేట్ బ్లైట్",
    "healthy": "ఆరోగ్యంగా"
  }
};

export const typeTranslations = {
  hi: {
    "Fungi": "फफूंद",
    "Bacteria": "बैक्टीरिया",
    "Virus": "वायरस",
    "Healthy": "स्वस्थ",
    "Phytophthora": "फाइटोफ्थोरा"
  },
  bn: {
    "Fungi": "ছত্রাক",
    "Bacteria": "ব্যাকটেরিয়া",
    "Virus": "ভাইরাস",
    "Healthy": "সুস্থ",
    "Phytophthora": "ফাইটোফথোরা"
  },
  ta: {
    "Fungi": "பூஞ்சை",
    "Bacteria": "பாக்டீரியா",
    "Virus": "வைரஸ்",
    "Healthy": "ஆரோக்கியம்",
    "Phytophthora": "பைட்டோப்தோரா"
  },
  te: {
    "Fungi": "ఫంగస్",
    "Bacteria": "బాక్టీరియా",
    "Virus": "వైరస్",
    "Healthy": "ఆరోగ్యంగా",
    "Phytophthora": "ఫైటోఫ్తోరా"
  }
};


// ===========================================
// 🧠 HELPERS
// ===========================================

export const translateDisease = (text, lang) => {
  if (lang === "en") return text;
  return diseaseTranslations[lang]?.[text] || text;
};

export const translateType = (text, lang) => {
  if (lang === "en") return text;
  return typeTranslations[lang]?.[text] || text;
};
