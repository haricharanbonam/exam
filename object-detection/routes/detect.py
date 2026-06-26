from flask import Blueprint, request, jsonify
from services.object_detection import detect_objects_from_file
import os
import traceback

detect_blueprint = Blueprint("detect", __name__)

# Anything in this set is treated as a cheating device if seen in the webcam frame.
DISALLOWED_OBJECTS = {"laptop", "cell phone", "tv", "keyboard", "mouse", "remote", "monitor"}


def _summarize(detected_objects):
    return {
        "person": detected_objects.get("person", 0),
        "laptop": detected_objects.get("laptop", 0),
        "cell phone": detected_objects.get("cell phone", 0),
        "tv": detected_objects.get("tv", 0),
        "monitor": detected_objects.get("monitor", 0),
        "keyboard": detected_objects.get("keyboard", 0),
        "mouse": detected_objects.get("mouse", 0),
        "remote": detected_objects.get("remote", 0),
    }


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

    os.makedirs("static/public", exist_ok=True)

    try:
        image = request.files["image"]
        image.save(public_path)
        print("✅ Image saved (overwritten).")
    except Exception as e:
        print("❌ Failed to save image:", traceback.format_exc())
        return jsonify({"error": "Image save failed", "details": str(e)}), 500

    try:
        detected_objects = detect_objects_from_file(public_path)
        print(f"✅ Detected objects: {detected_objects}")
    except Exception as e:
        print("❌ Object detection failed:", traceback.format_exc())
        return jsonify({"error": "Object detection failed", "details": str(e)}), 500

    person_count = detected_objects.get("person", 0)
    person_missing = person_count == 0
    device_detected = any(obj in DISALLOWED_OBJECTS for obj in detected_objects.keys())

    if not person_missing and not device_detected:
        return jsonify({
            "objects": _summarize(detected_objects),
            "suspicious": False,
        })

    reason = "person_missing" if person_missing else "device_detected"
    return jsonify({
        "objects": _summarize(detected_objects),
        "suspicious": True,
        "suspicious_reason": reason,
    })
