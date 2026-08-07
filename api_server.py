from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import random
import os

from signal_control import get_signal_plan
from ambulance_detection import (
    trigger_emergency, clear_emergency,
    get_emergency_state, simulate_random_emergency,
)
from traffic_database import (
    init_db, log_full_cycle, get_recent_traffic,
    get_recent_events, log_event
)
from traffic_prediction import get_predictions, init_predictions

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

ROADS = ["Road1", "Road2", "Road3"]

# ─── Shared State ─────────────────────────────────────────────────────────────
state = {
    "roads_data"  : {"Road1": 45, "Road2": 20, "Road3": 60},
    "signal_plan" : {},
    "predictions" : {},
    "last_updated": None,
}

# ─── Simulation ───────────────────────────────────────────────────────────────
def simulate_vehicle_count(current):
    delta = random.randint(-8, 8)
    hour  = time.localtime().tm_hour
    if 7 <= hour <= 9 or 17 <= hour <= 19:
        delta += random.randint(0, 6)
    elif 22 <= hour or hour <= 5:
        delta -= random.randint(0, 5)
    return max(5, min(100, current + delta))

def classify_traffic(count):
    if count > 50: return "HIGH"
    elif count > 20: return "MEDIUM"
    return "LOW"

# ─── Background Loop ──────────────────────────────────────────────────────────
def traffic_loop():
    print("[Loop] Traffic simulation started.")
    while True:
        try:
            for road in ROADS:
                state["roads_data"][road] = simulate_vehicle_count(
                    state["roads_data"][road]
                )

            emerg = get_emergency_state()
            ambulance_road = emerg["road"] if emerg["active"] else None

            signal_plan = get_signal_plan(state["roads_data"], ambulance_road=ambulance_road)
            predictions = get_predictions(state["roads_data"])

            state["signal_plan"]  = signal_plan
            state["predictions"]  = predictions
            state["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")

            log_full_cycle(state["roads_data"], signal_plan)
            simulate_random_emergency(probability=0.05)

        except Exception as e:
            print(f"[Loop ERROR] {e}")

        time.sleep(4)

# ─── API Endpoints ────────────────────────────────────────────────────────────
@app.route("/api/traffic", methods=["GET"])
def api_traffic():
    result = {}
    for road, count in state["roads_data"].items():
        result[road] = {"vehicles": count, "state": classify_traffic(count)}
    return jsonify({"data": result, "last_updated": state["last_updated"]})

@app.route("/api/signals", methods=["GET"])
def api_signals():
    return jsonify({
        "signals"     : state["signal_plan"],
        "emergency"   : get_emergency_state(),
        "last_updated": state["last_updated"],
    })

@app.route("/api/predictions", methods=["GET"])
def api_predictions():
    return jsonify({"predictions": state["predictions"], "last_updated": state["last_updated"]})

@app.route("/api/emergency/trigger", methods=["POST"])
def api_trigger_emergency():
    data = request.get_json()
    road = data.get("road") if data else None
    if not road:
        return jsonify({"error": "road is required"}), 400
    ok, msg = trigger_emergency(road)
    if ok:
        log_event("ambulance", road, "Emergency trigger via dashboard")
    return jsonify({"success": ok, "message": msg})

@app.route("/api/emergency/clear", methods=["POST"])
def api_clear_emergency():
    ok, msg = clear_emergency()
    return jsonify({"success": ok, "message": msg})

@app.route("/api/emergency/status", methods=["GET"])
def api_emergency_status():
    return jsonify(get_emergency_state())

@app.route("/api/history", methods=["GET"])
def api_history():
    limit = request.args.get("limit", 50, type=int)
    return jsonify(get_recent_traffic(limit))

@app.route("/api/events", methods=["GET"])
def api_events():
    return jsonify(get_recent_events(20))

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({"status": "running", "mode": "simulation", "last_updated": state["last_updated"]})

# ─── Startup ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  🚦 Smart Traffic Management System — API Server")
    print("  Mode: Full Simulation")
    print("=" * 55)
    init_db()
    init_predictions()
    threading.Thread(target=traffic_loop, daemon=True).start()
    print("\n  API running at: http://localhost:5000")
    print("  Frontend:        http://localhost:3000\n")
    app.run(debug=False, host="0.0.0.0", port=5000)
