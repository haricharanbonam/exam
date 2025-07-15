import cv2
import numpy as np

yolo_cfg = './yolo_files/yolov4.cfg'
yolo_weights = './yolo_files/yolov4.weights'
coco_names = './yolo_files/coco.names'

with open(coco_names, 'r') as f:
    class_names = [line.strip() for line in f.readlines()]

net = cv2.dnn.readNet(yolo_weights, yolo_cfg)
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]

ALLOWED_CLASSES = {"person", "cell phone", "laptop", "tvmonitor", "mouse", "keyboard", "bottle"}

def detect_objects_from_file(image_path):
    image = cv2.imread(image_path)
    height, width, _ = image.shape

    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416), (0, 0, 0), swapRB=True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layers)

    detected_objects = set()
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.3:
                label = class_names[class_id]
                if label in ALLOWED_CLASSES:  # 👈 Only include if it's relevant
                    detected_objects.add(label)

    return list(detected_objects)
