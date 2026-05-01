import os
import traceback

from flask import Blueprint, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

chat_bp = Blueprint("chat_bp", __name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@chat_bp.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.json

        user_message = data.get("message")
        lang = data.get("lang", "en")

        if not user_message:
            return jsonify({"error": "Message required"}), 400

        # 🌐 Language Mapping
        language_map = {
            "en": "English",
            "hi": "Hindi",
            "bn": "Bengali",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "zh": "Chinese"
        }

        selected_language = language_map.get(lang, "English")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""
You are AgriLeafNet AI Assistant.

- Always reply in {selected_language}
- Keep answers simple
- Help farmers with:
  - crop diseases
  - fertilizers
  - pesticides
  - farming advice
  - plant care
"""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )

        reply = response.choices[0].message.content

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500