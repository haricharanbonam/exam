from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
from pymongo import MongoClient
from datetime import datetime
import os
import traceback

MONGO_URI = "mongodb+srv://haricharanbonam:hari%402006@cluster0.pqjid.mongodb.net"
client = MongoClient(MONGO_URI)
db = client["examDB"]
remarks_collection = db["Remarks"]

detect_blueprint = Blueprint("detect", __name__)

@detect_blueprint.route("/detect", methods=["POST"])
def detect():
    print("===== /detect endpoint hit =====")
    
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    user_id = request.form.get("userId")
    test_id = request.form.get("testId")
    
    if not user_id or not test_id:
        return jsonify({"error": "Missing userId or testId"}), 400

    filename = f"{user_id}_{test_id}.jpg"
    public_path = os.path.join("static", "public", filename)
    image_url = f"https://seal-moved-seagull.ngrok-free.app/static/public/{filename}"

    os.makedirs("static/public", exist_ok=True)

    try:
        if not os.path.exists(public_path):
            image = request.files["image"]
            image.save(public_path)
            print("✅ Image saved for first time.")
        else:
            print("ℹ️ Image already exists. Skipping save.")
    except Exception as e:
        print("❌ Failed to save image:", traceback.format_exc())
        return jsonify({"error": "Image save failed", "details": str(e)}), 500

    try:
        detected_objects = detect_objects_from_file(public_path)
        print(f"✅ Detected objects: {detected_objects}")
    except Exception as e:
        print("❌ Object detection failed:", traceback.format_exc())
        return jsonify({"error": "Object detection failed", "details": str(e)}), 500

    disallowed_objects = {"laptop", "cell phone", "tv", "keyboard", "mouse", "remote", "monitor"}
    if not any(obj in disallowed_objects for obj in detected_objects):
        return jsonify({
            "objects": {
                "person": 1,
                "laptop": 0
            },
            "suspicious": False
        })

    try:
        existing = remarks_collection.find_one({"user": user_id, "test": test_id})

        if existing:
            cheat_count = existing.get("cheatCount", 1)

            if cheat_count >= 3:
                return jsonify({
                    "objects": {
                        "person": detected_objects.get("person", 0),
                        "laptop": detected_objects.get("laptop", 0)
                    },
                    "suspicious": True,
                    "limitExceeded": True
                })

            # Increment cheatCount
            cheat_count += 1
            remarks_collection.update_one(
                {"user": user_id, "test": test_id},
                {"$set": {"cheatCount": cheat_count}}
            )

            return jsonify({
                "objects": {
                    "person": detected_objects.get("person", 0),
                    "laptop": detected_objects.get("laptop", 0)
                },
                "suspicious": True,
                "cheatCount": cheat_count
            })
        else:
            remarks_collection.insert_one({
                "user": user_id,
                "test": test_id,
                "image_url": image_url,
                "cheatCount": 1,
                "time": datetime.utcnow()
            })

            return jsonify({
                "objects": {
                    "person": detected_objects.get("person", 0),
                    "laptop": detected_objects.get("laptop", 0)
                },
                "suspicious": True,
                "cheatCount": 1
            })

    except Exception as db_error:
        print("❌ MongoDB operation failed:", traceback.format_exc())
        return jsonify({
            "error": "Database operation failed",
            "details": str(db_error)
        }), 500
