from datetime import datetime
from db import remarks_collection  

def log_cheating_incident(student_id, image_url, reason):
    incident = {
        "student_id": student_id,
        "image_url": image_url,
        "reason": reason,
        "timestamp": datetime.utcnow()
    }
    remarks_collection.insert_one(incident)
