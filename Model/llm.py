from openai import OpenAI
from config import OPENAI_API_KEY
import json

client = OpenAI(api_key=OPENAI_API_KEY)


# =========================
# 🧹 NORMALIZE OUTPUT
# =========================
def clean_llm_output(data):
    cleaned = []

    for item in data:
        name = item.get("name", "").strip()
        dose = item.get("dose", "").strip()
        interval = item.get("interval", "").strip()

        if not name:
            continue

        cleaned.append({
            "name": name,
            "dose": dose,
            "interval": interval
        })

    return cleaned[:3]


# =========================
# 🤖 LLM (STRUCTURED JSON ONLY)
# =========================
def get_medicines_from_llm(disease: str):

    prompt = f"""
    You are an agricultural expert.

    A potato plant has: {disease}

    Provide EXACTLY 3 medicines.

    Return ONLY JSON in this format:

    [
      {{
        "name": "Medicine name",
        "dose": "e.g. 2.5g",
        "interval": "e.g. 7-10"
      }}
    ]

    RULES:
    - Use real agricultural medicines
    - Keep names in English
    - dose = amount per liter
    - interval = number of days (only number or range like 7-10)
    - NO explanations
    - NO text outside JSON
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        text = response.choices[0].message.content.strip()

        print("\n================ LLM RAW =================")
        print(text)

        # ✅ Try parsing JSON
        data = json.loads(text)

        cleaned = clean_llm_output(data)

        print("============== CLEANED ====================")
        print(cleaned)

        return cleaned

    except Exception as e:
        print("❌ LLM Error:", e)
        return []
