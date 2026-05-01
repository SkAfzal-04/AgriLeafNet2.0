# ===========================================
# 🌍 TRANSLATOR MODULE (NATURAL LANGUAGE FIX)
# ===========================================

from openai import OpenAI
import os
import json
import re

from db import (
    get_translation_cache,
    save_translation_cache
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ===========================================
# 🧠 SAFE JSON PARSER
# ===========================================
def safe_json_load(text):
    try:
        return json.loads(text)
    except:
        try:
            match = re.search(r"\[.*\]", text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except:
            pass

    print("❌ RAW LLM OUTPUT:\n", text)
    raise ValueError("Invalid JSON from LLM")


# ===========================================
# 🌿 TRANSLATE MEDICINES (NATURAL SENTENCE)
# ===========================================
def translate_medicines(disease, medicines, lang="en"):

    # ⚡ ENGLISH FAST PATH
    if lang == "en":
        return {
            "medicines": medicines,
            "warning": translate_warning(lang)
        }

    # ⚡ CACHE
    cached = get_translation_cache(disease, lang)
    if cached:
        print("⚡ CACHE HIT")
        return cached

    # ===========================================
    # 🤖 LLM PROMPT (VERY IMPORTANT)
    # ===========================================
    prompt = f"""
You are an agricultural expert.

Convert the following medicine data into natural farmer-friendly instructions in {lang}.

STRICT RULES:
- Return ONLY JSON array
- NO explanation
- NO extra text
- DO NOT change "name"
- Convert "dose" correctly
- Convert "interval" into a FULL natural sentence

IMPORTANT:
- Do NOT output "7-10 days"
- Convert into natural language like:

Bengali:
"প্রতি ৭-১০ দিন অন্তর ব্যবহার করুন"

Hindi:
"हर 7-10 दिन पर उपयोग करें"

Tamil:
"ஒவ்வொரு 7-10 நாட்களுக்கு ஒருமுறை பயன்படுத்தவும்"

Telugu:
"ప్రతి 7-10 రోజులకోసారి ఉపయోగించండి"

Output format:
[
  {{
    "name": "...",
    "dose": "...",
    "interval": "FULL SENTENCE"
  }}
]

Input:
{json.dumps(medicines, indent=2)}
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "Return ONLY valid JSON array. No extra text."
            },
            {"role": "user", "content": prompt}
        ]
    )

    raw_output = res.choices[0].message.content

    # ===========================================
    # 🧠 SAFE PARSE
    # ===========================================
    try:
        translated = safe_json_load(raw_output)
    except Exception as e:
        print("❌ LLM JSON ERROR:", e)
        translated = medicines  # fallback

    warning = translate_warning(lang)

    # ===========================================
    # 💾 CACHE SAVE
    # ===========================================
    save_translation_cache(disease, lang, translated, warning)

    return {
        "medicines": translated,
        "warning": warning
    }


# ===========================================
# ⚠️ WARNING TRANSLATION
# ===========================================
def translate_warning(lang="en"):

    warnings = {
        "en": "Use pesticide under expert supervision",
        "hi": "कीटनाशक का उपयोग विशेषज्ञ की देखरेख में करें",
        "bn": "বিশেষজ্ঞের পরামর্শে কীটনাশক ব্যবহার করুন",
        "ta": "நிபுணர் கண்காணிப்பில் பூச்சிக்கொல்லி பயன்படுத்தவும்",
        "te": "నిపుణుల పర్యవేక్షణలో పురుగుమందు ఉపయోగించండి"
    }

    return warnings.get(lang, warnings["en"])
