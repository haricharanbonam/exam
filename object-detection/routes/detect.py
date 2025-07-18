from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
from pymongo import MongoClient
from datetime import datetime
import os
import uuid
import traceback

# --- MongoDB Setup ---
MONGO_URI = "mongodb+srv://haricharanbonam:hari%402006@cluster0.pqjid.mongodb.net"
client = MongoClient(MONGO_URI)
db = client["examDB"]
remarks_collection = db["Remarks"]

# --- Blueprint ---
detect_blueprint = Blueprint("detect", __name__)

@detect_blueprint.route("/detect", methods=["POST"])
def detect():
    print("===== /detect endpoint hit =====")

    # --- Step 1: Validate Inputs ---
    if "image" not in request.files:
        print("❌ No image file in request")
        return jsonify({"error": "No image file uploaded"}), 400

    user_id = request.form.get("userId")
    test_id = request.form.get("testId")

    if not user_id or not test_id:
        print(f"❌ Missing fields. userId: {user_id}, testId: {test_id}")
        return jsonify({"error": "Missing userId or testId"}), 400

    # --- Step 2: Save Temporary Image ---
    try:
        image = request.files["image"]
        filename = f"{uuid.uuid4().hex}.jpg"
        temp_path = os.path.join("temp", filename)
        public_path = os.path.join("static", "public", filename)
        image_url = f"https://seal-moved-seagull.ngrok-free.app/static/public/{filename}"

        os.makedirs("temp", exist_ok=True)
        os.makedirs("static/public", exist_ok=True)
        image.save(temp_path)
        print(f"✅ Image saved to: {temp_path}")
    except Exception as e:
        print("❌ Failed to save image:", traceback.format_exc())
        return jsonify({"error": "Image save failed", "details": str(e)}), 500

    # --- Step 3: Run Object Detection ---
    try:
        detected_objects = detect_objects_from_file(temp_path)
        print(f"✅ Detected objects: {detected_objects}")
    except Exception as e:
        print("❌ Object detection failed:", traceback.format_exc())
        return jsonify({"error": "Object detection failed", "details": str(e)}), 500

    # --- Step 4: Handle "Only person" case ---
    if detected_objects == ["person"]:
        print("ℹ️ Only person detected. Not suspicious.")
        return jsonify({
            "objects": {
                "person": 1,
                "laptop": 0
            },
            "suspicious": False
        })

    # --- Step 5: Check for Existing Entry in DB ---
    try:
        print(f"🔍 Checking for previous remarks for user: {user_id}, test: {test_id}")
        existing = remarks_collection.find_one({"user": user_id, "test": test_id})
        if existing:
            print("⚠️ Existing remark found. Not saving again.")
            return jsonify({
                "objects": {
                    "person": detected_objects.get("person", 0),
                    "laptop": detected_objects.get("laptop",0)
                },
                "suspicious": True
            })
    except Exception as db_error:
        print("❌ MongoDB lookup failed:", traceback.format_exc())
        return jsonify({
            "error": "Database lookup failed",
            "details": str(db_error)
        }), 500

    # --- Step 6: Save to Public Folder and DB ---
    try:
        os.rename(temp_path, public_path)
        print(f"✅ File moved to public path: {public_path}")

        remarks_collection.insert_one({
            "user": user_id,
            "test": test_id,
            "remarks": [
                {"image_url": image_url, "time": datetime.utcnow()}
            ]
        })
        print("✅ Suspicious activity logged to DB.")
    except Exception as insert_error:
        print("❌ Failed to save image and log to DB:", traceback.format_exc())
        return jsonify({
            "error": "Failed to save remark",
            "details": str(insert_error)
        }), 500

    # --- Step 7: Return Success Response ---
    print("✅ Returning success response.")
    return jsonify({
        "objects": {
            "person": detected_objects.get("person",0),
            "laptop": detected_objects.get("laptop",0)
        },
        "suspicious": True
    })
