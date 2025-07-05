from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
import os
import uuid

detect_blueprint = Blueprint("detect", __name__)

@detect_blueprint.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    image = request.files["image"]
    filename = f"{uuid.uuid4().hex}.jpg"
    image_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    image.save(image_path)

    try:
        detected_objects = detect_objects_from_file(image_path)
        print(f"Detected objects: {detected_objects}")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

    return jsonify({"objects": detected_objects})
