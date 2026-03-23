import cv2
import random
import time

# ─── Vehicle detection using OpenCV ───────────────────────────────────────────
# Supports: webcam (source=0) or video file (source="traffic.mp4")
# Falls back to simulation if no camera/file is available

CAR_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_car.xml"

def detect_vehicles_from_source(source=0, duration_seconds=3):
    """
    Detect vehicles from a webcam or video file.
    source = 0 for webcam, or "path/to/video.mp4" for a file.
    Returns: vehicle count (int)
    """
    try:
        car_cascade = cv2.CascadeClassifier(CAR_CASCADE_PATH)
        cap = cv2.VideoCapture(source)

        if not cap.isOpened():
            print(f"[WARNING] Could not open source: {source}. Using simulation.")
            return simulate_vehicle_count()

        counts = []
        start = time.time()

        while (time.time() - start) < duration_seconds:
            ret, frame = cap.read()
            if not ret:
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            vehicles = car_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(30, 30)
            )
            counts.append(len(vehicles))

            # Draw bounding boxes
            for (x, y, w, h) in vehicles:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            cv2.imshow("Traffic Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

        avg_count = int(sum(counts) / len(counts)) if counts else simulate_vehicle_count()
        print(f"[OpenCV] Detected average: {avg_count} vehicles")
        return avg_count

    except Exception as e:
        print(f"[ERROR] OpenCV detection failed: {e}. Using simulation.")
        return simulate_vehicle_count()


def simulate_vehicle_count():
    """Simulate a realistic vehicle count with time-of-day variation."""
    hour = time.localtime().tm_hour
    if 7 <= hour <= 9 or 17 <= hour <= 19:
        return random.randint(60, 100)   # Rush hour
    elif 12 <= hour <= 14:
        return random.randint(35, 65)    # Lunch hour
    elif 22 <= hour or hour <= 5:
        return random.randint(5, 20)     # Night
    else:
        return random.randint(20, 55)    # Normal


def get_traffic_data(use_opencv=False, video_source=0):
    """
    Get vehicle counts for all 3 roads.
    use_opencv=True  → real detection (webcam or video)
    use_opencv=False → simulation mode
    """
    roads = ["Road1", "Road2", "Road3"]
    data = {}

    for road in roads:
        if use_opencv:
            print(f"[INFO] Detecting vehicles on {road}...")
            count = detect_vehicles_from_source(source=video_source, duration_seconds=2)
        else:
            count = simulate_vehicle_count()
        data[road] = count

    return data


def classify_traffic(count):
    """Return traffic state based on vehicle count."""
    if count > 50:
        return "HIGH"
    elif count > 20:
        return "MEDIUM"
    return "LOW"


if __name__ == "__main__":
    print("=== Traffic Detection Test ===")
    print("Running in SIMULATION mode...\n")
    data = get_traffic_data(use_opencv=False)
    for road, count in data.items():
        state = classify_traffic(count)
        print(f"  {road}: {count} vehicles → {state}")