from collections import defaultdict
import cv2
import numpy as np

yolo_cfg = './yolo_files/yolov4.cfg'
yolo_weights = './yolo_files/yolov4.weights'
coco_names = './yolo_files/coco.names'

# Load class names
with open(coco_names, 'r') as f:
    class_names = [line.strip() for line in f.readlines()]

# Load YOLO
net = cv2.dnn.readNet(yolo_weights, yolo_cfg)
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]

# Allowed classes
ALLOWED_CLASSES = {"person", "cell phone", "laptop", "tvmonitor", "mouse", "keyboard", "bottle"}

def detect_objects_from_file(image_path):
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Failed to load image at: {image_path}")
        return {}

    height, width, _ = image.shape

    # Create input blob
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416), (0, 0, 0), swapRB=True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layers)

    boxes = []
    confidences = []
    class_ids = []

    # Process detections
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > 0.3:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

        # Apply NMS
    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.3, 0.4)

    # 🔒 Safely handle the case when indexes is empty or weird
    if indexes is None or len(indexes) == 0:
        return {}

    # 🔧 Convert to a flat list safely
    if isinstance(indexes, tuple):
        if len(indexes) == 0:
            return {}
        indexes = indexes[0]

    # In case it's still nested (e.g., [[0], [1], ...]), flatten it
    try:
        indexes = indexes.flatten()
    except AttributeError:
        pass  # already flat

    detected_objects = defaultdict(int)
    try:
        for i in indexes:
            label = class_names[class_ids[i]]
            if label in ALLOWED_CLASSES:
                detected_objects[label] += 1
    except Exception as e:
        print(f"❌ Error while labeling: {e}")
        return {}

    return dict(detected_objects)

