from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
from pymongo import MongoClient
from datetime import datetime
import os
import uuid
MONGO_URI = "mongodb+srv://haricharanbonam:hari%402006@cluster0.pqjid.mongodb.net"
client = MongoClient(MONGO_URI)
db = client["examDB"]
remarks_collection = db["Remarks"]
detect_blueprint = Blueprint("detect", __name__)
@detect_blueprint.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    user_id = request.form.get("userId")
    test_id = request.form.get("testId")
    if not user_id or not test_id:
        return jsonify({"error": "Missing userId or testId"}), 400

    image = request.files["image"]
    filename = f"{uuid.uuid4().hex}.jpg"
    temp_path = os.path.join("temp", filename)
    public_path = os.path.join("static", "public", filename)
    image_url = f"https://seal-moved-seagull.ngrok-free.app/static/public/{filename}"

    os.makedirs("temp", exist_ok=True)
    os.makedirs("static/public", exist_ok=True)
    image.save(temp_path)

    try:
        detected_objects = detect_objects_from_file(temp_path)
        print(f"Detected objects: {detected_objects}")

        # If only one person is detected, do not save — not suspicious
        if detected_objects == ["person"]:
            return jsonify({
                "objects": detected_objects,
                "suspicious": False
            })

        # If already logged once, skip save but still return suspicious
        result = remarks_collection.find_one({"user": user_id, "test": test_id})
        if result:
            return jsonify({
                "objects": detected_objects,
                "suspicious": True
            })

        os.rename(temp_path, public_path)

        remarks_collection.insert_one({
            "user": user_id,
            "test": test_id,
            "remarks": [
                {"image_url": image_url, "time": datetime.utcnow()}
            ]
        })

        return jsonify({
            "objects": detected_objects,
            "suspicious": True
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
