import os

# ==========================================
# 🔒 SAFE ENV (BEFORE TORCH)
# ==========================================
os.environ["PYTHONHASHSEED"] = "0"
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":16:8"
os.environ["MKL_SERVICE_FORCE_INTEL"] = "1"
os.environ["FORCE_CPU"] = "1"

# ============================
# IMPORTS
# ============================
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image, UnidentifiedImageError

# ============================
# DEVICE
# ============================
device = torch.device("cpu")

# ============================
# BUILD MODEL
# ============================
def build_model():
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(1280, 2)
    return model

# ============================
# LOAD MODEL
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "leaf_nonleaf.pth")

model = None

def load_model_safe():
    global model
    try:
        model = build_model()
        state_dict = torch.load(MODEL_PATH, map_location=device)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        print("✅ Leaf model loaded successfully")
    except Exception as e:
        print("❌ Leaf model load failed:", e)
        model = None

# Load once at startup
load_model_safe()

# ============================
# PREPROCESS
# ============================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

CLASSES = ["leaf", "non_leaf"]

# ============================
# PREDICTION
# ============================
def predict_leaf_nonleaf(img_path):
    """
    Returns:
    - "leaf"
    - "non_leaf"
    - "error"
    """

    if model is None:
        print("❌ Model not loaded")
        return "error"

    # 🔥 SAFE IMAGE LOAD
    try:
        img = Image.open(img_path).convert("RGB")
    except UnidentifiedImageError:
        print("❌ Invalid image format")
        return "error"
    except Exception as e:
        print("❌ Image load error:", e)
        return "error"

    try:
        tensor = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            out = model(tensor)
            probs = torch.softmax(out, dim=1)

            confidence, pred = torch.max(probs, dim=1)
            pred = pred.item()
            confidence = round(float(confidence.item()) * 100, 2)

        label = CLASSES[pred]

        print(f"🌿 Leaf Prediction: {label} ({confidence}%)")

        return label

    except Exception as e:
        print("❌ Prediction error:", e)
        return "error"
