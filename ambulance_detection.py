import random
import time

# ─── Ambulance / Emergency Vehicle Detection ───────────────────────────────────
# In a real system this would use:
#   - GPS tracking of registered emergency vehicles
#   - RFID tags at intersections
#   - Siren audio detection (FFT + frequency analysis)
#   - Image classification (YOLO trained on ambulance class)
#
# For this project we support:
#   1. Manual trigger via API
#   2. Simulation (random emergency events)
#   3. OpenCV image classification hook (stub for extension)

ROADS = ["Road1", "Road2", "Road3"]

# In-memory emergency state (shared with api_server.py via import)
emergency_state = {
    "active"     : False,
    "road"       : None,
    "detected_at": None,
    "cleared_at" : None,
}


def trigger_emergency(road):
    """Manually trigger an emergency on a road."""
    if road not in ROADS:
        return False, f"Unknown road: {road}"

    emergency_state["active"]      = True
    emergency_state["road"]        = road
    emergency_state["detected_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    emergency_state["cleared_at"]  = None

    print(f"[EMERGENCY] 🚨 Ambulance detected on {road}!")
    return True, f"Emergency activated on {road}"


def clear_emergency():
    """Clear the current emergency."""
    emergency_state["active"]     = False
    emergency_state["cleared_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    road = emergency_state["road"]
    emergency_state["road"]       = None

    print(f"[EMERGENCY] ✅ Emergency cleared (was on {road})")
    return True, "Emergency cleared"


def get_emergency_state():
    """Return the current emergency state."""
    return dict(emergency_state)


def simulate_random_emergency(probability=0.1):
    """
    Randomly trigger an emergency (10% chance by default).
    Used in the main loop for demo purposes.
    """
    if not emergency_state["active"] and random.random() < probability:
        road = random.choice(ROADS)
        trigger_emergency(road)
        return road
    return None


def opencv_ambulance_detect(frame):
    """
    Stub for OpenCV-based ambulance detection.
    In production: run a YOLO model on the frame and check for 'ambulance' class.
    Returns: (detected: bool, road: str or None)
    """
    # TODO: Replace with actual YOLO inference
    # net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
    # ... run inference, check for ambulance bounding box ...
    return False, None


if __name__ == "__main__":
    print("=== Ambulance Detection Test ===\n")

    ok, msg = trigger_emergency("Road2")
    print(f"Trigger: {msg}")
    print(f"State  : {get_emergency_state()}\n")

    time.sleep(1)
    ok, msg = clear_emergency()
    print(f"Clear  : {msg}")
    print(f"State  : {get_emergency_state()}")