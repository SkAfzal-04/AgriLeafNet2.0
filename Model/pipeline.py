from db import get_from_db, save_to_db, remove_duplicates
from llm import get_medicines_from_llm


# =========================
# 🧹 NORMALIZE INPUT
# =========================
def normalize_disease(disease: str):
    return disease.lower().strip()


# =========================
# 🚀 MAIN PIPELINE
# =========================
def get_medicine_pipeline(disease):

    disease = normalize_disease(disease)

    # =========================
    # STEP 1: CHECK DB FIRST
    # =========================
    db_data = get_from_db(disease)

    if db_data:
        print("✅ Loaded medicines from DB")
        return db_data

    # =========================
    # STEP 2: LLM FALLBACK
    # =========================
    print("⚠️ No DB data, calling LLM...")

    llm_data = get_medicines_from_llm(disease)

    if not llm_data:
        print("❌ LLM returned nothing")
        return []

    # =========================
    # STEP 3: REMOVE DUPLICATES
    # =========================
    llm_data = remove_duplicates(llm_data)

    # =========================
    # STEP 4: SAVE TO DB
    # =========================
    for med in llm_data:
        try:
            save_to_db(
                disease,
                med["name"],
                med.get("dose", ""),
                med.get("interval", "")
            )
        except Exception as e:
            print("❌ Save error:", e)

    print("💾 Saved new medicines to DB")

    # =========================
    # STEP 5: RETURN CLEAN DATA
    # =========================
    return llm_data
