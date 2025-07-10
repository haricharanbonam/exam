from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
from pymongo import MongoClient
from datetime import datetime
import os
import uuid

# MongoDB setup
MONGO_URI = "mongodb+srv://haricharanbonam:hari%402006@cluster0.pqjid.mongodb.net"
client = MongoClient(MONGO_URI)
db = client["examDB"]
remarks_collection = db["proctor_remarks"]

# Blueprint setup
detect_blueprint = Blueprint("detect", __name__)

@detect_blueprint.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    # Extract metadata from the request
    user_id = request.form.get("userId")
    test_id = request.form.get("testId")
    if not user_id or not test_id:
        return jsonify({"error": "Missing userId or testId"}), 400

    image = request.files["image"]
    filename = f"{uuid.uuid4().hex}.jpg"
    image_path = os.path.join("temp", filename)
    image_url = f"https://your-server.com/evidence/{filename}"
    os.makedirs("temp", exist_ok=True)
    image.save(image_path)

    try:
        # Object Detection Logic
        detected_objects = detect_objects_from_file(image_path)
        print(f"Detected objects: {detected_objects}")

        # Upsert remark entry
        result = remarks_collection.find_one({"user": user_id, "test": test_id})
        if result:
            # Update existing document
            remarks_collection.update_one(
                {"_id": result["_id"]},
                {"$push": {"remarks": {"image_url": image_url, "time": datetime.utcnow()}}}
            )
        else:
            # Create new document
            remarks_collection.insert_one({
                "user": user_id,
                "test": test_id,
                "remarks": [
                    {"image_url": image_url, "time": datetime.utcnow()}
                ]
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

    return jsonify({"objects": detected_objects, "savedImageURL": image_url})