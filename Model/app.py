
import os
import uuid
import traceback
import numpy as np
import random

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from keras.models import load_model
from keras.preprocessing import image

from ChatbotService import chat_bp
from pipeline import get_medicine_pipeline
from db import init_db
from pymongo import MongoClient
from translator import translate_medicines, translate_warning



# ===========================================
# ⚙️ ENV CONFIG (SAFE CPU MODE)
# ===========================================
os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":16:8"
os.environ["PYTHONHASHSEED"] = "0"
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["FORCE_CPU"] = "1"


# ===========================================
# 📁 CONFIG
# ===========================================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_CONTENT_LENGTH = 6 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "disease_category_model.keras")
TYPE_MODEL_PATH = os.path.join(BASE_DIR, "disease_type_model.keras")

CATEGORY_SIZE = (224, 224)
TYPE_SIZE = (256, 256)


# ===========================================
# 🚀 FLASK INIT
# ===========================================
app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
MONGO_URI = os.getenv("MONGO_URI")

print("MONGO URI EXISTS:", MONGO_URI is not None)

try:
    client_db = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

    # Force connection test
    client_db.admin.command("ping")

    print("✅ MongoDB Connected Successfully")

    db = client_db["AgriDB"]

    users = db["users"]
    history = db["history"]

except Exception as e:
    print("❌ MongoDB Connection Error")
    print(e)
 
init_db()

CORS(app, resources={
    r"/*": {"origins": [
        "http://localhost:3000",
        "https://agrileafnet1.vercel.app"
    ]}
})

otp_store = {}
# ===========================================
# 🧰 HELPERS
# ===========================================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def safe_save_file(file_storage):
    ext = os.path.splitext(file_storage.filename)[1] or ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_FOLDER, name)
    file_storage.save(path)
    return name, path


def preprocess(path, size):
    img = image.load_img(path, target_size=size)
    arr = image.img_to_array(img) / 255.0
    return np.expand_dims(arr, axis=0)


# ===========================================
# 🤖 LOAD MODELS
# ===========================================
def load_keras_model(path):
    try:
        return load_model(path), None
    except Exception as e:
        return None, str(e)


def load_leaf_model(filepath):
    from leaf_model import predict_leaf_nonleaf
    return predict_leaf_nonleaf(filepath)


model_category, err_cat = load_keras_model(CATEGORY_MODEL_PATH)
model_type, err_type = load_keras_model(TYPE_MODEL_PATH)

# Auto-detect input sizes
try:
    CATEGORY_SIZE = (model_category.input_shape[1], model_category.input_shape[2])
except:
    pass

try:
    TYPE_SIZE = (model_type.input_shape[1], model_type.input_shape[2])
except:
    pass


# ===========================================
# 🏷 LABELS
# ===========================================
CATEGORY_CLASSES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy"
]

TYPE_CLASSES = [
    "Bacteria", "Fungi", "Healthy",
    "Nematode", "Pest", "Phytophthora", "Virus"
]


def build_disease_name(category_label, type_label):
    disease = category_label.split("___")[-1].replace("_", " ").lower()

    if type_label.lower() != "healthy":
        disease += f" {type_label.lower()}"

    return disease.strip()


# ===========================================
# ❤️ HEALTH CHECK
# ===========================================
@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "models": {
            "category": model_category is not None,
            "type": model_type is not None
        },
        "errors": {
            "category": err_cat,
            "type": err_type
        }
    })


# ===========================================
# 🔍 PREDICT
# ===========================================
@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename, filepath = safe_save_file(file)

    try:
        # 🌿 Leaf check
        leaf_label = load_leaf_model(filepath)

        if leaf_label == "error":
            return jsonify({"error": "Leaf detection failed"}), 500

        if leaf_label == "non_leaf":
            return jsonify({
                "is_leaf": False,
                "message": "Uploaded image is not a leaf."
            }), 200

        if not model_category or not model_type:
            return jsonify({
                "error": "Models not loaded",
                "detail": {"category": err_cat, "type": err_type}
            }), 500

        # 🦠 CATEGORY
        cat_img = preprocess(filepath, CATEGORY_SIZE)
        pred_cat = model_category.predict(cat_img)

        cat_idx = int(np.argmax(pred_cat))
        cat_label = CATEGORY_CLASSES[cat_idx]
        cat_conf = round(float(np.max(pred_cat)) * 100, 2)

        # 🔬 TYPE
        type_img = preprocess(filepath, TYPE_SIZE)
        pred_type = model_type.predict(type_img)

        type_idx = int(np.argmax(pred_type))
        type_label = TYPE_CLASSES[type_idx]
        type_conf = round(float(np.max(pred_type)) * 100, 2)

        disease_name = build_disease_name(cat_label, type_label)

        print("🧠 Disease:", disease_name)

        return jsonify({
            "is_leaf": True,
            "category_prediction": cat_label,
            "category_confidence": cat_conf,
            "disease_type_prediction": type_label,
            "disease_type_confidence": type_conf,
            "disease_name": disease_name
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ===========================================
# 💊 MEDICINES (FINAL PIPELINE - FIXED)
# ===========================================
@app.route("/medicines", methods=["GET"])
def medicines():

    disease = request.args.get("disease")
    lang = request.args.get("lang", "en")

    if not disease:
        return jsonify({"error": "Disease required"}), 400
    
    

    try:
        # ===========================================
        # 🌿 STEP 1: GET RAW MEDICINES
        # ===========================================
        medicines_raw = get_medicine_pipeline(disease)

        # ===========================================
        # ⚡ STEP 2: TRANSLATION + CACHE LAYER
        # ===========================================
        result = translate_medicines(
            disease=disease,
            medicines=medicines_raw,
            lang=lang
        )

        # ===========================================
        # 🧠 FINAL RESPONSE
        # ===========================================
        return jsonify({
            "medicines": result["medicines"],
            "warning": result["warning"]
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



# ===========================================
# 🖼 VIEW IMAGE
# ===========================================
@app.route("/view_image/<filename>")
def view_image(filename):
    path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))

    if os.path.exists(path):
        return send_file(path, mimetype="image/jpeg")

    return jsonify({"error": "Not found"}), 404


# ===========================================
# Chatbot Blueprint
# ===========================================
app.register_blueprint(chat_bp)

# =========================
# 📱 SEND OTP
# =========================
@app.route("/send-otp", methods=["POST"])
def send_otp():
    try:
        data = request.get_json()
 
        phone = data.get("phone")
 
        otp = str(random.randint(1000, 9999))
        otp_store[phone] = otp
 
        print(f"📱 OTP for {phone}: {otp}")
 
        return jsonify({
            "msg": "OTP sent",
            "otp": otp
        })
 
    except Exception as e:
        print("SEND ERROR:", e)
        return jsonify({"msg": "Server error"}), 500
 
 
# =========================
# 🔐 VERIFY OTP
# =========================
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()
 
        phone = data.get("phone")
        otp = data.get("otp")
 
        print("VERIFY:", phone, otp)
 
        stored = otp_store.get(phone)
 
        if stored == otp:
            return jsonify({
                "msg": "Login success",
                "user_id": phone
            })
 
        return jsonify({"msg": "Invalid OTP"}), 400
 
    except Exception as e:
        print("VERIFY ERROR:", e)
        return jsonify({"msg": "Server error"}), 500
 
 
# =========================
# 💾 SAVE CHAT (FIXED)
# =========================
@app.route("/save-chat", methods=["POST"])
def save_chat():
    try:
        data = request.get_json()
 
        print("💾 SAVE DATA:", data)  # 🔥 debug
 
        history.insert_one({
            "user_id": data.get("user_id"),
            "message": data.get("message"),
            "reply": data.get("reply"),
            "lang": data.get("lang")
        })
 
        return jsonify({"msg": "Saved"})
 
    except Exception as e:
        print("SAVE ERROR:", e)
        return jsonify({"msg": "Server error"}), 500
 
 
# =========================
# 📊 GET HISTORY (FIXED)
# =========================
@app.route("/get-history/<user_id>", methods=["GET"])
def get_history(user_id):
    try:
        data = list(history.find(
            {"user_id": user_id},
            {"_id": 0}
        ))
 
        print("📊 HISTORY:", data)  # 🔥 debug
 
        return jsonify(data)
 
    except Exception as e:
        print("GET HISTORY ERROR:", e)
        return jsonify([]), 500

# ===========================================
# 🚀 RUN
# ===========================================
if __name__ == "__main__":
    print("🚀 AgriLeafNet running...")
    print("Category model error:", err_cat)
    print("Type model error:", err_type)

    app.run(host="0.0.0.0", port=7860, debug=True)
