import sqlite3
import json
from config import DB_NAME

conn = sqlite3.connect(DB_NAME, check_same_thread=False)
cursor = conn.cursor()


# =========================
# 🧹 NORMALIZE
# =========================
def normalize(text):
    return text.lower().strip()


def normalize_medicine(name):
    name = name.lower().strip()
    name = name.replace("75% wp", "")
    name = name.replace("fungicide", "")
    return name.strip()


# =========================
# 🧱 INIT DB (UPDATED)
# =========================
def init_db():

    # 💊 medicines table (existing)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disease TEXT,
        medicine TEXT,
        norm_med TEXT,
        dose TEXT,
        interval TEXT,
        product_name TEXT,
        link TEXT,
        rating TEXT,
        UNIQUE(disease, norm_med)
    )
    """)

    # 🌍 TRANSLATION CACHE TABLE (NEW)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS translation_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disease TEXT,
        lang TEXT,
        medicines TEXT,
        warning TEXT,
        UNIQUE(disease, lang)
    )
    """)

    conn.commit()


# =========================
# 💾 SAVE MEDICINES
# =========================
def save_to_db(disease, medicine, dose, interval,
               product_name="", link="", rating=""):

    disease = normalize(disease)
    medicine = medicine.strip()
    norm_med = normalize_medicine(medicine)

    try:
        cursor.execute("""
            INSERT OR IGNORE INTO medicines
            (disease, medicine, norm_med, dose, interval,
             product_name, link, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            disease,
            medicine,
            norm_med,
            dose,
            interval,
            product_name,
            link,
            rating
        ))

        conn.commit()

    except Exception as e:
        print("❌ DB Save Error:", e)


# =========================
# 🔍 FETCH MEDICINES
# =========================
def get_from_db(disease):

    disease = normalize(disease)

    cursor.execute("""
        SELECT disease, medicine, dose, interval,
               product_name, link, rating
        FROM medicines
        WHERE disease=?
    """, (disease,))

    rows = cursor.fetchall()

    return [
        {
            "disease": r[0],
            "name": r[1],
            "dose": r[2],
            "interval": r[3],
            "product_name": r[4],
            "link": r[5],
            "rating": r[6]
        }
        for r in rows
    ]


# =========================
# 🧠 REMOVE DUPLICATES
# =========================
def remove_duplicates(medicines):

    seen = set()
    unique = []

    for m in medicines:
        key = normalize_medicine(m["name"])

        if key not in seen:
            seen.add(key)
            unique.append(m)

    return unique


# =========================================================
# 🌍 TRANSLATION CACHE (NEW SYSTEM)
# =========================================================

# =========================
# GET CACHE
# =========================
def get_translation_cache(disease, lang):

    disease = normalize(disease)

    cursor.execute("""
        SELECT medicines, warning
        FROM translation_cache
        WHERE disease=? AND lang=?
    """, (disease, lang))

    row = cursor.fetchone()

    if not row:
        return None

    return {
        "medicines": json.loads(row[0]),
        "warning": row[1]
    }


# =========================
# SAVE CACHE
# =========================
def save_translation_cache(disease, lang, medicines, warning):

    disease = normalize(disease)

    try:
        cursor.execute("""
            INSERT OR REPLACE INTO translation_cache
            (disease, lang, medicines, warning)
            VALUES (?, ?, ?, ?)
        """, (
            disease,
            lang,
            json.dumps(medicines),
            warning
        ))

        conn.commit()

    except Exception as e:
        print("❌ Translation Cache Error:", e)
